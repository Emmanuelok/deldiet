"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function formatMoney(cents, currency = "cad") {
  return Number.isInteger(cents) ? new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100) : null;
}

async function json(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(typeof body.error === "string" ? body.error : "We couldn’t reach the pricing service. Please try again.");
    error.code = body.code;
    throw error;
  }
  return body;
}

export function useAtelierPayment(recipe, quantity) {
  const [catalogue, setCatalogue] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState(null);
  const [checkout, setCheckout] = useState({ busy: false, error: "" });
  const [payment, setPayment] = useState(null);
  const idempotency = useRef(null);
  const submitting = useRef(false);
  const payload = JSON.stringify({recipe,quantity});
  const retry = useCallback(() => setRefresh((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/atelier/catalogue", {cache:"no-store",signal:controller.signal}).then(json)
      .then((data) => { if (!controller.signal.aborted) setCatalogue(data); })
      .catch(() => { if (!controller.signal.aborted) setCatalogue({ mode:"unavailable", checkoutAvailable:false, items:[] }); });
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    if (!catalogue || catalogue.mode === "unavailable") return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/atelier/quote", { method:"POST", headers:{"Content-Type":"application/json"}, body:payload, cache:"no-store", signal:controller.signal })
        .then(json).then((data) => { if (!controller.signal.aborted) setResult({payload, refresh, data}); })
        .catch((error) => { if (!controller.signal.aborted) setResult({payload,refresh,data:{available:false,message:error.message}}); });
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [payload,catalogue,refresh]);

  useEffect(() => {
    function resume(event) {
      if (!event.persisted) return;
      submitting.current = false;
      setCheckout({busy:false,error:""});
      retry();
    }
    window.addEventListener("pageshow",resume);
    return () => window.removeEventListener("pageshow",resume);
  }, [retry]);

  const quote = catalogue && catalogue.mode !== "unavailable" && result?.payload === payload && result?.refresh === refresh ? result.data : null;

  async function buy(safetyAck, name) {
    if (submitting.current || !safetyAck || !catalogue?.checkoutAvailable || !quote?.available || !quote.quoteId) return;
    submitting.current = true;
    setCheckout({busy:true,error:""});
    const fingerprint = JSON.stringify([payload,quote.quoteId,name.trim()]);
    if (idempotency.current?.fingerprint !== fingerprint) idempotency.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/atelier/checkout", { method:"POST", headers: {"Content-Type":"application/json","Idempotency-Key":idempotency.current.key},
        body:JSON.stringify({recipe:{...recipe,name:name.trim()},quantity,quoteId:quote.quoteId,safetyAck}) });
      const data = await json(response);
      if (typeof data.sessionId === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(data.sessionId)) {
        window.location.assign("/origin-bar?session_id="+encodeURIComponent(data.sessionId));
        return;
      }
      const destination = new URL(data.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("Checkout returned an unexpected destination. Please refresh the price and try again.");
      window.location.assign(destination.href);
    } catch (error) {
      submitting.current = false;
      if (error.code === "checkout_closed") idempotency.current = null;
      setCheckout({busy:false,error:error.message || "Checkout could not open. Please try again."});
      retry();
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session_id");
    const controller = new AbortController();
    let timer;
    let attempts = 0;
    const update = (data) => { if (!controller.signal.aborted) setPayment(data); };
    async function verify() {
      try {
        const data = await fetch(`/api/atelier/session?session_id=${encodeURIComponent(session)}`,{cache:"no-store",signal:controller.signal}).then(json);
        if (!["paid","pending","open","expired","failed"].includes(data.status)) throw new Error("Unable to verify this checkout.");
        update(data);
        if (data.status === "pending" && attempts++ < 8 && !controller.signal.aborted) timer = window.setTimeout(verify, 4000);
      } catch { update({status:"unknown"}); }
    }
    if (session) {
      update({status:"checking"});
      void verify();
    } else if (params.get("checkout") === "cancelled") update({status:"cancelled"});
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [refresh]);

  function dismissPayment() {
    const url = new URL(window.location.href);
    url.searchParams.delete("session_id"); url.searchParams.delete("checkout");
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
    setPayment(null);
  }
  return {catalogue,quote,checkout,buy,retry,payment,dismissPayment};
}
