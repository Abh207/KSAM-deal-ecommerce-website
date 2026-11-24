import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const storeName = p.store || p.source || p.platform || "Partner Store";
    const storeSlug = String(p.store_slug || storeName).toLowerCase().replace(/[^a-z0-9]/g, "-");
    try {
      const { data: storeRow } = await supabase
        .from("stores")
        .select("id")
        .or(`slug.eq.${storeSlug},name.ilike.%${storeName}%`)
        .maybeSingle();
      if (storeRow?.id) storeId = storeRow.id;
    } catch {}

    const upsertData: Record<string, any> = {
      store_id: storeId,
      external_id: rawExternalId,
      name: p.name || p.title || "External Product",
      title: p.title || p.name || "External Product",
      brand: p.brand || null,
      category: p.category || "General",
      description: p.description || null,
      image_url: p.image_url || p.image || null,
      price: p.price ? Number(p.price) : 0,
      old_price: (p.old_price || p.oldPrice) ? Number(p.old_price || p.oldPrice) : null,
      discount_percent: p.discount ? Number(p.discount) : 0,
      rating: p.rating ? Number(p.rating) : 0,
      reviews: p.reviews ? Number(p.reviews) : 0,
      availability: p.availability || "In Stock",
      product_url: p.product_url || p.url || null,
      affiliate_url: p.affiliate_url || p.url || p.product_url || null,
      source: p.source || storeSlug,
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
