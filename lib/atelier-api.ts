import { AtelierError, digest, normalizeRecipe, object, parseQuantity, parseStripeProduct, quoteRecipe } from "./atelier-pricing";
import type { Catalogue, Pickup, PriceItem, Quote, Recipe } from "./atelier-pricing";

type Environment = Record<string,string|undefined>;
type Action = "catalogue" | "quote" | "checkout" | "session";
const stripeApi = "https://api.stripe.com/v1";
const encoder = new TextEncoder();
const sessionPattern = /^cs_(test|live)_[a-zA-Z0-9]{8,250}$/;
const cookiePath = "/api/atelier/session";
const unavailable = "Live menu prices are unavailable right now. You can still explore and save a cup.";
const pickupClosed = "The bar is not currently accepting paid pickup orders.";
const noCache = {"Cache-Control":"private, no-store, max-age=0","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff"};

function response(body: unknown,status=200,headers: Record<string,string>={}) {
  return Response.json(body,{status,headers:{...noCache,...headers}});
}
function mode(env: Environment) {
  if (/^(sk|rk)_live_\S+$/.test(env.STRIPE_SECRET_KEY || "")) return "live";
  if (/^(sk|rk)_test_\S+$/.test(env.STRIPE_SECRET_KEY || "")) return "test";
  return "unavailable";
}
function pickupLocation(env: Environment): Pickup | null {
  const name = env.ATELIER_PICKUP_NAME?.trim(), address = env.ATELIER_PICKUP_ADDRESS?.trim();
  return name && address && name.length <= 120 && address.length <= 300 ? {name,address} : null;
}
function origin(env: Environment): string {
  const url = new URL(env.ATELIER_PUBLIC_URL || (env.VERCEL_ENV === "preview" && env.VERCEL_URL ? "https://"+env.VERCEL_URL : "https://www.deldiet.coffee"));
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new AtelierError(503,"Online pickup needs a configured HTTPS return address.");
  }
  return url.origin;
}
function assertSameOrigin(req: Request) {
  const clientOrigin = req.headers.get("origin");
  if (clientOrigin && clientOrigin !== new URL(req.url).origin) throw new AtelierError(403,"Open the Atelier to continue.");
}
async function stripe(path: string,env: Environment,fetcher: typeof fetch,body?: URLSearchParams,key?: string) {
  if (mode(env) === "unavailable") throw new AtelierError(503,unavailable);
  let result: Response;
  try {
    result = await fetcher(stripeApi+path,{
      method:body ? "POST" : "GET", cache:"no-store", signal:AbortSignal.timeout(8000),
      headers:{ Authorization:"Bearer "+env.STRIPE_SECRET_KEY,"Stripe-Version":"2026-10-28.endive",
        ...(body ? {"Content-Type":"application/x-www-form-urlencoded"} : {}), ...(key ? {"Idempotency-Key":key} : {})},
      ...(body ? {body:body.toString()} : {}),
    });
  } catch { throw new AtelierError(503,"Stripe could not be reached. Please retry the same order."); }
  if (!result.ok) {
    const data = object(await result.json().catch(()=>({})));
    const error = object(data.error);
    if (result.status === 409 || error.type === "idempotency_error" || error.code === "idempotency_key_in_use") {
      throw new AtelierError(409,"This checkout attempt is already in progress or has changed. Retry the same order or refresh its price.");
    }
    if (result.status === 404 && path.startsWith("/checkout/sessions/")) throw new AtelierError(404,"Checkout session not found.");
    throw new AtelierError(503,"Stripe is unable to complete this request. Please try again.");
  }
  return object(await result.json());
}
async function products(env: Environment,fetcher: typeof fetch): Promise<PriceItem[]> {
  const collected: PriceItem[] = [];
  let after = "";
  const seen = new Set<string>();
  for (let page=0;page<100;page++) {
    const params = new URLSearchParams({active:"true",limit:"100","expand[]":"data.default_price"});
    if (after) params.set("starting_after",after);
    const batch = await stripe("/products?"+params,env,fetcher);
    if (!Array.isArray(batch.data) || typeof batch.has_more !== "boolean") throw new AtelierError(503,unavailable);
    for (const item of batch.data) {
      const parsed = parseStripeProduct(item,mode(env) === "live");
      if (parsed) collected.push(parsed);
    }
    if (!batch.has_more) {
      const ids = new Set<string>();
      for (const item of collected) {
        if (ids.has(item.id)) throw new AtelierError(503,"Live menu configuration needs review.");
        ids.add(item.id);
      }
      return collected.sort((a,b)=>a.id.localeCompare(b.id));
    }
    const last = object(batch.data.at(-1)).id;
    if (typeof last !== "string" || !/^prod_[a-zA-Z0-9_]+$/.test(last) || seen.has(last)) throw new AtelierError(503,unavailable);
    seen.add(last);
    after = last;
  }
  throw new AtelierError(503,unavailable);
}
async function catalogue(env: Environment,fetcher: typeof fetch): Promise<Catalogue> {
  const priceMode = mode(env), pickup = pickupLocation(env);
  const empty: Catalogue = {mode:"unavailable",currency:"cad",checkoutAvailable:false,message:unavailable,pickup,items:[]};
  if (priceMode === "unavailable") return empty;
  if (env.VERCEL_ENV === "production" && priceMode !== "live") return empty;
  // Account readiness gates payment without suppressing independently available current prices.
  const [items,business] = await Promise.all([products(env,fetcher),stripe("/account",env,fetcher).catch(()=>null)]);
  const hasMenu = items.some(item=>item.kind === "drink");
  const previewLive = env.VERCEL_ENV === "preview" && priceMode === "live";
  const taxRate = env.ATELIER_PICKUP_TAX_RATE_ID?.trim();
  const taxReady = (!taxRate || /^txr_[a-zA-Z0-9]+$/.test(taxRate)) && env.ATELIER_AUTOMATIC_TAX!=="true";
  const webhookReady = /^whsec_[a-zA-Z0-9_]+$/.test(env.STRIPE_WEBHOOK_SECRET || "");
  const acceptsPayment = Boolean(hasMenu && !previewLive && taxReady && webhookReady && pickup && env.ATELIER_ORDERS_OPEN === "true" &&
    business?.charges_enabled === true && business?.payouts_enabled === true);
  return {mode:priceMode,currency:"cad",checkoutAvailable:acceptsPayment,pickup,items,
    message:!hasMenu ? "No priced Atelier drinks have been published yet." : acceptsPayment ? null : pickupClosed};
}
// Briefly coalesce public browsing reads. Checkout always re-reads the complete Stripe catalogue.
let browse: { signature: string; validUntil: number; pending: Promise<Catalogue> } | null = null;
function browseCatalogue(env: Environment,fetcher: typeof fetch) {
  if (fetcher !== fetch || mode(env) === "unavailable") return catalogue(env,fetcher);
  const signature = [env.STRIPE_SECRET_KEY,env.STRIPE_WEBHOOK_SECRET,env.VERCEL_ENV,env.ATELIER_ORDERS_OPEN,env.ATELIER_PICKUP_NAME,env.ATELIER_PICKUP_ADDRESS,env.ATELIER_PICKUP_TAX_RATE_ID,env.ATELIER_AUTOMATIC_TAX].join("\n");
  if (browse && browse.signature === signature && browse.validUntil > Date.now()) return browse.pending;
  const pending = catalogue(env,fetcher).catch(error=>{if(browse?.pending===pending) browse=null;throw error;});
  browse={signature,validUntil:Date.now()+10000,pending};
  return pending;
}
async function rawBody(req: Request,limit: number): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(req.headers.get("content-length") || 0)>limit) throw new AtelierError(413,"The request is too large.");
  const reader = req.body?.getReader();
  if (!reader) throw new AtelierError(400,"A request body is required.");
  const chunks = [];
  let total = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    total += value.length;
    if (total>limit) { await reader.cancel(); throw new AtelierError(413,"The request is too large."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.length; }
  return bytes;
}
async function readBody(req: Request) {
  assertSameOrigin(req);
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("content-type") || "")) throw new AtelierError(415,"Send the recipe as JSON.");
  const bytes = await rawBody(req,16384);
  try { return object(JSON.parse(new TextDecoder().decode(bytes))); }
  catch { throw new AtelierError(400,"The recipe could not be read."); }
}
async function hmac(env: Environment,value:string) {
  const secret = env.ATELIER_SESSION_SECRET || env.STRIPE_SECRET_KEY;
  if (!secret) throw new AtelierError(503,unavailable);
  const key = await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode("deldiet:atelier:receipt:v1:"+value)));
  return Array.from(signature,b=>b.toString(16).padStart(2,"0")).join("");
}
async function cookieName(sessionId:string) { return "dd_atelier_"+(await digest(sessionId)).slice(0,20); }
async function authorizeReceipt(req:Request,id:string,env:Environment) {
  const name=await cookieName(id);
  const provided=(req.headers.get("cookie")||"").split(";").map(item=>item.trim()).find(item=>item.startsWith(name+"="))?.slice(name.length+1);
  if (!provided || !/^[a-f0-9]{64}$/.test(provided)) throw new AtelierError(403,"Open this confirmation in the browser that started checkout.");
  const expected=await hmac(env,id);
  let diff=0;for(let i=0;i<64;i++) diff |= expected.charCodeAt(i)^provided.charCodeAt(i);
  if(diff!==0) throw new AtelierError(403,"Open this confirmation in the browser that started checkout.");
}
function orderMetadata(recipe:Recipe,cups:number,quote:Quote,pickup:Pickup,ref:string,name:string) {
  const metadata: Record<string,string> = {deldiet_surface:"origin_atelier",order_reference:ref,quantity:String(cups),
    subtotal_cents:String(quote.subtotal),pickup_name:pickup.name,pickup_address:pickup.address,fulfilment:"pickup",safety_acknowledged:"yes"};
  for (const [key,value] of Object.entries(recipe)) metadata["recipe_"+key]=Array.isArray(value) ? value.join(" · ") || "None" : String(value);
  if(name) metadata.cup_name=name;
  return metadata;
}
async function createCheckout(body:Record<string,unknown>,req:Request,env:Environment,fetcher:typeof fetch,cat:Catalogue,recipe:Recipe,quantity:number,quote:Quote) {
  if(!cat.checkoutAvailable || !cat.pickup) throw new AtelierError(503,cat.message || pickupClosed);
  if(!quote.available || !quote.quoteId || body.quoteId!==quote.quoteId) throw new AtelierError(409,"The live price or availability changed. Review a fresh quote and try again.");
  if(body.safetyAck!==true) throw new AtelierError(400,"Confirm your recipe and ingredient acknowledgement before checkout.");
  const key=req.headers.get("Idempotency-Key") || "";
  if(!/^[a-zA-Z0-9:_-]{16,128}$/.test(key)) throw new AtelierError(400,"A checkout attempt key is required.");
  const rawName=object(body.recipe).name;
  if(rawName != null && (typeof rawName!=="string" || rawName.length>80 || /[\x00-\x1f\x7f]/.test(rawName))) throw new AtelierError(400,"Use a cup name of up to 80 characters.");
  const ref="DA-"+(await digest("origin-atelier:"+key)).slice(0,16).toUpperCase();
  const site=origin(env);
  if (new URL(req.url).origin !== site) throw new AtelierError(409,"Open checkout on the bar’s configured website.");
  const taxRate = env.ATELIER_PICKUP_TAX_RATE_ID?.trim();
  if (taxRate) {
    const verifiedRate = await stripe("/tax_rates/"+encodeURIComponent(taxRate),env,fetcher);
    if (verifiedRate.id!==taxRate || verifiedRate.active!==true || verifiedRate.livemode!==(cat.mode==="live")) {
      throw new AtelierError(503,"The pickup tax rate needs review before checkout can open.");
    }
  }
  const params=new URLSearchParams({mode:"payment",integration_identifier:"deldiet_atelier_kqzwyhfc","adaptive_pricing[enabled]":"false",
    "automatic_tax[enabled]":"false",
    success_url:site+"/origin-bar?session_id={CHECKOUT_SESSION_ID}",cancel_url:site+"/origin-bar?checkout=cancelled",
    client_reference_id:ref,"payment_intent_data[description]":"Deldiet Origin Atelier pickup "+ref,
    "custom_text[submit][message]":`Pickup at ${cat.pickup.name} — ${cat.pickup.address}. Order ${ref}.`});
  for(const [i,line] of quote.lines.entries()) {
    params.set(`line_items[${i}][price]`,line.priceId);params.set(`line_items[${i}][quantity]`,String(line.quantity));
    if (taxRate) params.set(`line_items[${i}][tax_rates][0]`,taxRate);
  }
  const details=orderMetadata(recipe,quantity,quote,cat.pickup,ref,typeof rawName==="string"?rawName.trim():"");
  for(const [key,value] of Object.entries(details)) {
    params.set(`metadata[${key}]`,value);params.set(`payment_intent_data[metadata][${key}]`,value);
  }
  const created = await stripe("/checkout/sessions",env,fetcher,params,"origin-atelier:"+key);
  const id = created.id;
  if (typeof id !== "string" || !sessionPattern.test(id) || !id.startsWith("cs_"+cat.mode+"_")) throw new AtelierError(503,"Stripe could not open this checkout.");
  // Stripe can replay the original open response for an idempotent request after the session has closed.
  const current = await stripe("/checkout/sessions/"+id,env,fetcher);
  if (current.id !== id || (current.status !== "open" && current.status !== "expired" && current.status !== "complete")) throw new AtelierError(503,"Stripe could not confirm this checkout.");
  if (current.status === "expired") return response({error:"This checkout expired. Start a new checkout attempt.",code:"checkout_closed"},409);
  const token = await hmac(env,id);
  const receiptCookie = {"Set-Cookie":`${await cookieName(id)}=${token}; HttpOnly; Secure; SameSite=Lax; Path=${cookiePath}; Max-Age=172800`};
  if (current.status === "complete") {
    confirmedSession(id,current,env);
    return response({sessionId:id},200,receiptCookie);
  }
  if (typeof current.url !== "string") throw new AtelierError(503,"Stripe could not open this checkout.");
  const target = new URL(current.url);
  if (target.protocol !== "https:" || target.hostname !== "checkout.stripe.com" || target.username || target.password || target.port) throw new AtelierError(503,"Stripe could not open this checkout.");
  return response({url:target.toString()},200,receiptCookie);
}
function confirmedSession(id: string,session: Record<string,unknown>,env: Environment) {
  const meta=object(session.metadata);
  if(session.id!==id || session.mode!=="payment" || session.livemode!==(mode(env)==="live") ||
    session.currency!=="cad" || meta.deldiet_surface!=="origin_atelier" ||
    typeof meta.order_reference!=="string" || !/^DA-[0-9A-F]{16}$/.test(meta.order_reference) ||
    session.client_reference_id!==meta.order_reference || typeof meta.pickup_name!=="string" || typeof meta.pickup_address!=="string") throw new AtelierError(404,"Atelier checkout was not found.");
  const subtotal=session.amount_subtotal,total=session.amount_total;
  if(!Number.isSafeInteger(subtotal) || typeof total!=="number" || !Number.isSafeInteger(total) ||
    typeof subtotal!=="number" || subtotal<=0 || total<subtotal || String(subtotal)!==meta.subtotal_cents) throw new AtelierError(409,"The payment totals require review. Please keep your Stripe receipt.");
  const intent = object(session.payment_intent);
  const failure = session.status==="complete" && session.payment_status==="unpaid" && (intent.status==="canceled" || object(intent.metadata).atelier_async_payment_failed==="yes");
  const status=session.status==="complete" && session.payment_status==="paid" ? "paid" : failure ? "failed" :
    session.status==="expired" ? "expired" : session.status==="open" ? "open" : "pending";
  return {status,amountTotal:total,currency:"cad",reference:meta.order_reference,pickup:{name:meta.pickup_name,address:meta.pickup_address}};
}
async function receipt(req:Request,env:Environment,fetcher:typeof fetch) {
  const id = new URL(req.url).searchParams.get("session_id") || "";
  if (!sessionPattern.test(id)) throw new AtelierError(400,"A valid checkout session is required.");
  await authorizeReceipt(req,id,env);
  const session = await stripe("/checkout/sessions/"+encodeURIComponent(id)+"?expand%5B%5D=payment_intent",env,fetcher);
  return response(confirmedSession(id,session,env));
}
export async function atelierResponse(action:Action,req:Request,env:Environment=process.env,fetcher:typeof fetch=fetch):Promise<Response> {
  try {
    const method= action==="catalogue" || action==="session" ? "GET" : "POST";
    if(req.method!==method) return response({error:"Method not allowed."},405,{Allow:method});
    if(action==="session") return await receipt(req,env,fetcher);
    if(action==="catalogue") {
      try {return response(await browseCatalogue(env,fetcher));}
      catch {return response({mode:"unavailable",currency:"cad",checkoutAvailable:false,message:unavailable,pickup:pickupLocation(env),items:[]},503);}
    }
    const input=await readBody(req);
    const recipe=normalizeRecipe(input.recipe),quantity=parseQuantity(input.quantity);
    const cat=action==="checkout" ? await catalogue(env,fetcher) : await browseCatalogue(env,fetcher);
    const quote=await quoteRecipe(cat,recipe,quantity,env.ATELIER_PICKUP_TAX_RATE_ID?.trim() || null);
    if(action==="quote") return response(quote);
    return await createCheckout(input,req,env,fetcher,cat,recipe,quantity,quote);
  } catch (error) {
    return error instanceof AtelierError ? response({error:error.message},error.status) :
      response({error:"The Atelier could not complete this request. Please try again."},503);
  }
}

async function stripeEvent(req:Request,env:Environment) {
  if (!env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) throw new AtelierError(503,"Event endpoint is unavailable.");
  const parts=(req.headers.get("stripe-signature") || "").split(",").map(item=>item.trim().split("="));
  const timestamp=parts.find(([kind])=>kind==="t")?.[1] || "";
  const signatures=parts.filter(([kind,value])=>kind==="v1" && /^[a-fA-F0-9]{64}$/.test(value)).map(([,value])=>value);
  if (!/^\d{10}$/.test(timestamp) || !signatures.length || Math.abs(Date.now()/1000-Number(timestamp))>300) throw new AtelierError(400,"Invalid event signature.");
  const payload=await rawBody(req,1048576);
  const prefix=encoder.encode(timestamp+".");
  const signed=new Uint8Array(prefix.length+payload.length);
  signed.set(prefix); signed.set(payload,prefix.length);
  const key=await crypto.subtle.importKey("raw",encoder.encode(env.STRIPE_WEBHOOK_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
  const checks=await Promise.all(signatures.map(signature=>{
    const bytes=Uint8Array.from(signature.match(/../g)!,hex=>parseInt(hex,16));
    return crypto.subtle.verify("HMAC",key,bytes,signed);
  }));
  if (!checks.includes(true)) throw new AtelierError(400,"Invalid event signature.");
  try {return object(JSON.parse(new TextDecoder().decode(payload)));}
  catch {throw new AtelierError(400,"Invalid event payload.");}
}
const paymentEvents = new Set(["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed"]);
export async function atelierWebhook(req:Request,env:Environment=process.env,fetcher:typeof fetch=fetch) {
  try {
    if (req.method!=="POST") return response({error:"Method not allowed."},405,{Allow:"POST"});
    const event=await stripeEvent(req,env);
    if (!paymentEvents.has(String(event.type))) return response({received:true});
    if (mode(env)==="unavailable") throw new AtelierError(503,"Payment reconciliation will retry.");
    if (event.livemode!==(mode(env)==="live")) return response({received:true});
    const delivered=object(object(event.data).object);
    if (object(delivered.metadata).deldiet_surface!=="origin_atelier") return response({received:true});
    const id=delivered.id;
    if (typeof id!=="string" || !sessionPattern.test(id) || typeof event.id!=="string" || !/^evt_[A-Za-z0-9]+$/.test(event.id)) throw new AtelierError(400,"Invalid event identifiers.");
    // Reconcile against current state, including delayed or out-of-order deliveries.
    const current=await stripe("/checkout/sessions/"+id+"?expand%5B%5D=payment_intent",env,fetcher);
    const confirmed=confirmedSession(id,current,env);
    const intent=object(current.payment_intent);
    const metadata=object(intent.metadata);
    if (typeof intent.id!=="string" || !/^pi_[A-Za-z0-9]+$/.test(intent.id) || intent.currency!=="cad" ||
        intent.livemode!==event.livemode || metadata.order_reference!==confirmed.reference || metadata.deldiet_surface!=="origin_atelier") throw new AtelierError(503,"Payment reconciliation will retry.");
    // These are separate, monotonic markers. An old failure event cannot overwrite a paid or staff-managed order.
    let marker: string, value: string;
    if (confirmed.status==="paid") {
      if (intent.status!=="succeeded" || intent.amount_received!==confirmed.amountTotal) throw new AtelierError(503,"Payment reconciliation will retry.");
      marker="atelier_fulfillment_queue"; value="paid_awaiting_staff";
    } else if (event.type==="checkout.session.async_payment_failed" && current.payment_status==="unpaid") {
      marker="atelier_async_payment_failed"; value="yes";
    } else {
      return response({received:true});
    }
    if (metadata[marker]===undefined || metadata[marker]==="") {
      const form=new URLSearchParams({[`metadata[${marker}]`]:value});
      await stripe("/payment_intents/"+intent.id,env,fetcher,form,"atelier-marker:"+intent.id+":"+marker);
    }
    return response({received:true});
  } catch (error) {
    return error instanceof AtelierError ? response({error:error.message},error.status) : response({error:"Payment reconciliation will retry."},503);
  }
}
