import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

// Bundle the same extensionless TS imports used by Next for the Node test runner.
const compiled = await build({entryPoints:["lib/atelier-pricing.ts"],bundle:true,platform:"node",format:"esm",write:false});
const { normalizeRecipe, parseStripeProduct, quoteRecipe, parseQuantity } =
  await import("data:text/javascript;base64,"+Buffer.from(compiled.outputFiles[0].contents).toString("base64"));
const recipe = {
  origin:"Ethiopia",drink:"Latte",roast:"medium",milk:"Organic whole",temp:"Hot",extraction:"Espresso machine",caffeine:"Regular",
  sweetener:"None",size:"sprout",cup:"For here · ceramic",boosters:[],syrups:[],toppings:[],extraShots:0,sweetLevel:2,
};
function stripeProduct(id,name,unitAmount,metadata) {
  return {id:"prod_"+id,active:true,livemode:false,name,
    metadata:{deldiet_surface:"origin_atelier",atelier_id:id,...metadata},
    default_price:{id:"price_"+id,product:"prod_"+id,active:true,livemode:false,type:"one_time",billing_scheme:"per_unit",currency:"cad",unit_amount:unitAmount,unit_amount_decimal:String(unitAmount)}};
}
const rawBase = stripeProduct("latte","Guji latte",550,{atelier_kind:"drink",atelier_recipe:JSON.stringify(recipe)});
const base = parseStripeProduct(rawBase,false);
function addon(id,field,value,amount,appliesTo="latte") {
  return parseStripeProduct(stripeProduct(id,id,amount,{atelier_kind:"addon",atelier_field:field,atelier_value:value,atelier_applies_to:appliesTo}),false);
}
const menu = {mode:"test",currency:"cad",checkoutAvailable:true,pickup:{name:"Fixture",address:"Test address"},message:null,
  items:[base,addon("oat","milk","Oat (barista)",75),addon("shot","extraShots","1",100),addon("ice","temp","Iced",0),addon("rose","syrups","Rose",35)]};
test("only accepts active tagged default CAD one-time fixed-per-unit Stripe prices in the matching mode",()=>{
  assert.equal(base.unitAmount,550);
  assert.equal(base.recipe.sweetLevel,0);
  for(const badPrice of [{currency:"usd"},{active:false},{livemode:true},{product:"prod_other"},{unit_amount:0},{billing_scheme:"tiered"},
    {type:"recurring"},{transform_quantity:{divide_by:2}},{custom_unit_amount:{}},{unit_amount_decimal:"550.5"}]){
    assert.equal(parseStripeProduct({...rawBase,default_price:{...rawBase.default_price,...badPrice}},false),null);
  }
  for(const badProduct of [{active:false},{livemode:true},{metadata:{...rawBase.metadata,deldiet_surface:"other"}},
    {metadata:{...rawBase.metadata,atelier_recipe:"{}"}}]) assert.equal(parseStripeProduct({...rawBase,...badProduct},false),null);
  assert.equal(addon("unavailable","syrups","imaginary",150),null);
  assert.equal(addon("unknown","__proto__","Rose",150),null);
});
test("normalizes catalogue names and demands compatible sizes, temperatures, extraction and bounded choices",()=>{
  assert.deepEqual(normalizeRecipe({...recipe,origin:{n:"Ethiopia",price:0},drink:{n:"Latte",price:0},subtotal:-50}),base.recipe);
  for(const bad of [{drink:"Unknown"},{extract:"Oops",extraction:"Chemex"},{extraShots:3},{temp:"Blended"}, {origin:"elsewhere"},
    {drink:"Espresso",size:"sprout"}, {boosters:["MCT oil","MCT oil"]},{toppings:["Phantom"]},{sweetLevel:7}]) assert.throws(()=>normalizeRecipe({...recipe,...bad}));
  for(const qty of [0,11,1.5,"1",null]) assert.throws(()=>parseQuantity(qty));
  assert.equal(parseQuantity(10),10);
});
test("quotes every selected paid and included option, scales quantities per cup and ignores posted money",async()=>{
  const selection=normalizeRecipe({...recipe,milk:"Oat (barista)",extraShots:2,temp:"Iced",syrups:["Rose"],price:0,discount:550});
  const quote=await quoteRecipe(menu,selection,2,null);
  assert.equal(quote.available,true);
  assert.equal(quote.subtotal,1720);
  assert.equal(quote.lines.find(item=>item.id==="shot").quantity,4);
  assert.equal(quote.lines.find(item=>item.id==="ice").unitAmount,0);
  assert.equal(quote.lines.length,5);
  assert.equal(quote.quoteId,(await quoteRecipe(menu,selection,2,null)).quoteId);
  for(const modified of [{...menu,pickup:{name:"Other",address:"Other"}},{...menu,mode:"live"},
    {...menu,items:menu.items.map(item=>item.id==="oat"?{...item,priceId:"price_new"}:item)}])
    assert.notEqual(quote.quoteId,(await quoteRecipe(modified,selection,2,null)).quoteId);
  assert.notEqual(quote.quoteId,(await quoteRecipe(menu,selection,2,"txr_Fixture")).quoteId);
});
test("rejects incomplete, incompatible or ambiguous modifier mappings instead of discounting them",async()=>{
  const oat=normalizeRecipe({...recipe,milk:"Oat (barista)"});
  for(const items of [[base],[base,addon("oat","milk","Oat (barista)",50,"other")],
    [base,addon("oat","milk","Oat (barista)",50),addon("oat2","milk","Oat (barista)",80)]]) {
    const quote=await quoteRecipe({...menu,items},oat,1,null);
    assert.equal(quote.available,false);assert.equal(quote.quoteId,null);assert.equal(quote.subtotal,null);
  }
  assert.equal((await quoteRecipe(menu,normalizeRecipe({...recipe,toppings:["Cocoa dust"]}),1,null)).available,false);
  const presetWithSyrup={...base,recipe:normalizeRecipe({...recipe,syrups:["Rose"]})};
  assert.equal((await quoteRecipe({...menu,items:[presetWithSyrup]},base.recipe,1,null)).available,false);
});

const webhookModule = await build({ entryPoints:["lib/atelier-api.ts"],bundle:true,platform:"node",format:"esm",write:false });
const { atelierWebhook } = await import("data:text/javascript;base64,"+Buffer.from(webhookModule.outputFiles[0].contents).toString("base64"));
const { createHmac } = await import("node:crypto");
const env = { STRIPE_SECRET_KEY:"sk_test_fixture",STRIPE_WEBHOOK_SECRET:"whsec_fixture" };
const sampleId = "cs_test_123456789abcdef";
const sampleRef = "DA-0123456789ABCDEF";
const paymentMetadata = {deldiet_surface:"origin_atelier",order_reference:sampleRef,pickup_name:"Fixture",pickup_address:"Example",subtotal_cents:"500"};
function eventRequest(type,opts={}) {
  const data=JSON.stringify({id:"evt_Example123",type,livemode:false,data:{object:{id:sampleId,metadata:{deldiet_surface:"origin_atelier"}}}});
  const timestamp=opts.timestamp ?? Math.floor(Date.now()/1000);
  const signature=createHmac("sha256",opts.secret || env.STRIPE_WEBHOOK_SECRET).update(timestamp+"."+data).digest("hex");
  return new Request("https://deldiet.example/api/atelier/webhook",{method:"POST",headers:{"stripe-signature":`t=${timestamp},v1=${signature}`},body:data});
}
test("webhook authenticates the raw body and rejects stale or forged events before any Stripe lookup",async()=>{
  for(const opts of [{timestamp:1000000000},{secret:"whsec_other"}]) {
    const res=await atelierWebhook(eventRequest("checkout.session.completed",opts),env,()=>assert.fail("unexpected call"));
    assert.equal(res.status,400);
  }
});
test("webhook records verified paid pickups once, handles out-of-order events and preserves staff fields",async()=>{
  const metadata={...paymentMetadata,staff_fulfillment:"in_progress"};
  const intent={id:"pi_Fixture007",currency:"cad",status:"succeeded",livemode:false,amount_received:550,metadata};
  const session={id:sampleId,currency:"cad",mode:"payment",livemode:false,status:"complete",payment_status:"paid",amount_subtotal:500,amount_total:550,
    client_reference_id:sampleRef,metadata:paymentMetadata,payment_intent:intent};
  let writes=0;
  const mock=async(input,config)=>{
    const url=new URL(input);
    if(url.pathname.endsWith("/"+sampleId)) return Response.json(session);
    assert.equal(url.pathname,"/v1/payment_intents/"+intent.id);
    const changes=new URLSearchParams(config.body);
    assert.deepEqual([...changes.keys()],["metadata[atelier_fulfillment_queue]"]);
    assert.match(config.headers["Idempotency-Key"],/pi_Fixture007:atelier_fulfillment_queue$/);
    metadata.atelier_fulfillment_queue=changes.get("metadata[atelier_fulfillment_queue]");
    writes++; return Response.json(intent);
  };
  for(const type of ["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed"]) {
    assert.equal((await atelierWebhook(eventRequest(type),env,mock)).status,200);
  }
  assert.equal(writes,1);assert.equal(metadata.atelier_fulfillment_queue,"paid_awaiting_staff");
  assert.equal(metadata.staff_fulfillment,"in_progress");
  metadata.atelier_fulfillment_queue="fulfilled";
  assert.equal((await atelierWebhook(eventRequest("checkout.session.completed"),env,mock)).status,200);
  assert.equal(writes,1);
  assert.equal(metadata.atelier_fulfillment_queue,"fulfilled");
  intent.amount_received=10;
  assert.equal((await atelierWebhook(eventRequest("checkout.session.completed"),env,mock)).status,503);
});
test("an unpaid failed event is recorded separately and never queues staff fulfillment",async()=>{
  let updates=0;
  const mock=async(url,config)=>{
    if(String(url).includes("/checkout/sessions/")) return Response.json({
      id:sampleId,currency:"cad",mode:"payment",livemode:false,status:"complete",payment_status:"unpaid",amount_subtotal:500,amount_total:500,
      client_reference_id:sampleRef,metadata:paymentMetadata,
      payment_intent:{id:"pi_Fixture007",currency:"cad",livemode:false,metadata:paymentMetadata,status:"requires_payment_method",amount_received:0},
    });
    assert.deepEqual([...new URLSearchParams(config.body)], [["metadata[atelier_async_payment_failed]","yes"]]);updates++;return Response.json({});
  };
  assert.equal((await atelierWebhook(eventRequest("checkout.session.completed"),env,mock)).status,200);
  assert.equal(updates,0);
  assert.equal((await atelierWebhook(eventRequest("checkout.session.async_payment_failed"),env,mock)).status,200);assert.equal(updates,1);
});
