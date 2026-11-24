import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_DAILY_CREDIT_CAP = 20;

function isUrlSsrfSafe(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0"
    ) {
      return false;
    }

    if (
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home")
    ) {
      return false;
    }

    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [_, a, b] = ipv4Match.map(Number);
      if (a === 127 || a === 10 || a === 0) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 169 && b === 254) return false;
    }

    if (hostname.includes("fe80:") || hostname.includes("fc00:") || hostname.includes("fd00:")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function sanitizeText(str: any): string {
  if (!str || typeof str !== "string") return "";
  const clean = str
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.startsWith("Verified hot deal on")) return "";
  return clean;
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

    let body: { limit?: number; category?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const limit = Math.min(Math.max(body.limit || 10, 1), 30);

    // Find products missing about_text or description, and not enriched in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let query = supabase
      .from("products")
      .select("id, name, title, description, about_text, product_url, affiliate_url, external_id, enriched_at, raw")
      .or(`enriched_at.is.null,enriched_at.lt.${sevenDaysAgo}`)
      .eq("is_active", true)
      .limit(limit);

    if (body.category) {
      query = query.eq("category", body.category);
    }

    const { data: candidates, error: fetchErr } = await query;
    if (fetchErr || !Array.isArray(candidates)) {
      return new Response(
        JSON.stringify({ success: false, error: fetchErr?.message || "Failed to fetch candidates" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ id: string; enriched: boolean; source: string }> = [];

    for (const prod of candidates) {
      try {
        const targetUrl = prod.affiliate_url || prod.product_url;
        let foundDesc: string | null = null;
        let source = "none";

        if (targetUrl && isUrlSsrfSafe(targetUrl)) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
          });
          clearTimeout(timeout);

          if (res.ok) {
            const html = await res.text();
            // JSON-LD description
            const jsonLdMatch = html.match(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
            if (jsonLdMatch && jsonLdMatch[1]) {
              try {
                const data = JSON.parse(jsonLdMatch[1]);
                const item = Array.isArray(data) ? data[0] : (data["@graph"] ? data["@graph"][0] : data);
                if (item?.description) {
                  const cleaned = sanitizeText(item.description);
                  if (cleaned.length >= 20) {
                    foundDesc = cleaned;
                    source = "store_jsonld";
                  }
                }
              } catch {}
            }

            // OpenGraph fallback
            if (!foundDesc) {
              const ogMatch = html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
              if (ogMatch && ogMatch[1]) {
                const cleaned = sanitizeText(ogMatch[1]);
                if (cleaned.length >= 20) {
                  foundDesc = cleaned;
                  source = "store_og";
                }
              }
            }
          }
        }

        const enrichedAt = new Date().toISOString();
        const updatePayload: Record<string, any> = {
          enriched_at: enrichedAt,
          enrichment_source: source
        };
        if (foundDesc) {
          updatePayload.about_text = foundDesc;
          updatePayload.description = foundDesc;
        }

        await supabase.from("products").update(updatePayload).eq("id", prod.id);
        results.push({ id: prod.id, enriched: Boolean(foundDesc), source });
      } catch (prodErr) {
        results.push({ id: prod.id, enriched: false, source: "error" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: candidates.length,
        enriched_count: results.filter((r) => r.enriched).length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Batch enrichment error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
