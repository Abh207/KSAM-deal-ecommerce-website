import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isInvalidStore(name: unknown): boolean {
  if (!name || typeof name !== "string") return true;
  const s = name.trim().toLowerCase();
  return (
    !s ||
    s.includes("serp") ||
    s.includes("google") ||
    s.includes("ksam") ||
    s.includes("licensed shopping data") ||
    s === "partner store" ||
    s === "partner-store" ||
    s === "general" ||
    s === "unknown" ||
    s === "undefined" ||
    s === "null" ||
    s === "search" ||
    s === "deal" ||
    s === "deals"
  );
}

function deriveStoreName(p: any): string {
  if (p.store_name && !isInvalidStore(p.store_name)) {
    return p.store_name.trim();
  }
  if (p.source && !isInvalidStore(p.source)) {
    return p.source.trim();
  }
  if (p.store && !isInvalidStore(p.store)) {
    return p.store.trim();
  }
  const url = p.product_url || p.affiliate_url || p.url || "";
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^(www\.|m\.)/i, "").toLowerCase();
      if (host.includes("flipkart.")) return "Flipkart";
      if (host.includes("amazon.")) return "Amazon";
      if (host.includes("myntra.")) return "Myntra";
      if (host.includes("ajio.")) return "AJIO";
      if (host.includes("croma.")) return "Croma";
      if (host.includes("tatacliq.")) return "Tata CLiQ";
      if (host.includes("boat-lifestyle.") || host.includes("boat.")) return "boAt";
      if (host.includes("meesho.")) return "Meesho";
      if (host.includes("nykaa.")) return "Nykaa";
      if (host.includes("reliancedigital.")) return "Reliance Digital";
      if (host.includes("vijaysales.")) return "Vijay Sales";
      if (host.includes("etoren.")) return "Etoren.com";
      if (host.includes("samsung.")) return "Samsung";
      if (host.includes("apple.")) return "Apple";
      const domain = host.replace(/\.(co|com|org|net)\.[a-z]{2,4}$/i, "").replace(/\.[a-z]{2,8}$/i, "").split(".").pop();
      if (domain && !isInvalidStore(domain)) {
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {}
  }
  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase service credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { product?: any } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const p = body.product;
    if (!p) {
      return new Response(JSON.stringify({ success: false, error: "No product payload provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const rawExternalId = p.external_id ? String(p.external_id) : (p.id ? String(p.id).replace(/^ext-/, "") : "");
    if (!rawExternalId) {
      return new Response(JSON.stringify({ success: false, error: "Missing external_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Match or find store_id
    let storeId: string | null = null;
    const resolvedStoreName = deriveStoreName(p);
    const storeLookup = resolvedStoreName || p.store || p.source || p.platform || "";
    const storeSlug = String(p.store_slug || storeLookup).toLowerCase().replace(/[^a-z0-9]/g, "-");
    try {
      if (storeLookup) {
        const { data: storeRow } = await supabase
          .from("stores")
          .select("id")
          .or(`slug.eq.${storeSlug},name.ilike.%${storeLookup}%`)
          .maybeSingle();
        if (storeRow?.id) storeId = storeRow.id;
      }
    } catch {}

    const cleanDesc = (p.description && !String(p.description).startsWith("Verified hot deal on")) ? p.description : null;

    const upsertData: Record<string, any> = {
      store_id: storeId,
      external_id: rawExternalId,
      name: p.name || p.title || "External Product",
      title: p.title || p.name || "External Product",
      brand: p.brand && !String(p.brand).toLowerCase().includes("ksam") ? p.brand : null,
      category: p.category && String(p.category).toLowerCase() !== "deals" ? p.category : "General",
      description: cleanDesc,
      image_url: p.image_url || p.image || null,
      price: p.price ? Number(p.price) : 0,
      old_price: (p.old_price || p.oldPrice) ? Number(p.old_price || p.oldPrice) : null,
      discount_percent: p.discount ? Number(p.discount) : 0,
      rating: p.rating ? Number(p.rating) : 0,
      reviews: p.reviews ? Number(p.reviews) : 0,
      availability: p.availability || "In Stock",
      store_name: resolvedStoreName || p.store_name || p.store || null,
      product_url: p.product_url || p.productUrl || p.url || null,
      affiliate_url: p.affiliate_url || p.affiliateUrl || p.url || p.product_url || null,
      source: resolvedStoreName || p.source || p.store_name || storeSlug || null,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      price_updated_at: new Date().toISOString()
    };

    let savedId = null;
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("external_id", rawExternalId)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("products").update(upsertData).eq("id", existing.id);
      savedId = existing.id;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("products")
        .insert(upsertData)
        .select("id")
        .single();
      if (!insertErr && inserted?.id) {
        savedId = inserted.id;
      }
    }

    return new Response(JSON.stringify({ success: true, id: savedId, external_id: rawExternalId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
