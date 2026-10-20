import { supabase } from "../../lib/supabase";

export function formatTimeAgo(dateString) {
  if (!dateString) return "Recently updated";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 5) return "Price updated just now";
  if (diffMins < 60) return `Price updated ${diffMins}m ago`;
  if (diffHours < 24) return `Price updated ${diffHours}h ago`;
  if (diffDays === 1) return "Price updated yesterday";
  return `Price updated ${diffDays}d ago`;
}

export function normalizeDatabaseProduct(product) {
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price ?? product.oldPrice ?? 0);
  const calculatedDiscount =
    product.discount_percent ??
    (oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);

  const rawImage = product.image_url || product.image || "";
  let resolvedImage = rawImage;
  if (rawImage && !rawImage.startsWith("http://") && !rawImage.startsWith("https://") && !rawImage.startsWith("data:")) {
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = rawImage.replace(/^\/+/, "");
    resolvedImage = rawImage.startsWith(normalizedBase) ? rawImage : `${normalizedBase}${clean}`;
  }

  const storeObj = Array.isArray(product.stores) ? product.stores[0] : product.stores;
  const storeName = storeObj?.name || product.store || "KSAM Deal";
  const storeLogo = storeObj?.logo_url || product.storeLogo || null;
  const storeWebsite = storeObj?.base_url || storeObj?.website || product.storeWebsite || "#";

  const affiliateUrl = product.affiliate_url || product.product_url || product.url || "#";

  return {
    id: product.id,
    name: product.name || product.title || "Untitled Deal",
    brand: product.brand || "",
    category: product.category || "Deals",
    price,
    oldPrice: oldPrice > 0 ? oldPrice : price,
    discount: Number(calculatedDiscount || 0),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    availability: product.availability || "In Stock",
    image: resolvedImage,
    additionalImages: Array.isArray(product.additional_images) ? product.additional_images : [],
    store: storeName,
    storeLogo,
    storeWebsite,
    url: affiliateUrl,
    affiliateUrl,
    productUrl: product.product_url || affiliateUrl,
    priceUpdatedAt: product.price_updated_at || product.last_seen_at || product.created_at,
    priceUpdatedLabel: formatTimeAgo(product.price_updated_at || product.last_seen_at || product.created_at)
  };
}

export async function getDeals(options = {}) {
  const {
    category = "All",
    store = "All",
    sort = "biggest_discount",
    page = 1,
    pageSize = 12
  } = options;

  let query = supabase
    .from("products")
    .select(
      `
        id,
        name,
        title,
        brand,
        category,
        image_url,
        additional_images,
        price,
        old_price,
        discount_percent,
        rating,
        reviews,
        availability,
        product_url,
        affiliate_url,
        is_active,
        created_at,
        last_seen_at,
        price_updated_at,
        stores (
          id,
          name,
          slug,
          logo_url,
          base_url
        )
      `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Filter by category
  if (category && category !== "All") {
    query = query.ilike("category", `%${category}%`);
  }

  // Filter by store
  if (store && store !== "All") {
    query = query.or(`stores.slug.eq.${store},stores.name.ilike.%${store}%`);
  }

  // Sorting
  switch (sort) {
    case "price_low_high":
      query = query.order("price", { ascending: true });
      break;
    case "price_high_low":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("last_seen_at", { ascending: false });
      break;
    case "biggest_discount":
    default:
      query = query.order("discount_percent", { ascending: false, nullsFirst: false });
      break;
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out after 8s")), 8000)
  );

  const { data, count, error } = await Promise.race([query, timeoutPromise]);

  if (error) {
    throw error;
  }

  const products = (data || []).map(normalizeDatabaseProduct);
  const total = count || 0;
  const hasMore = to < total - 1;

  return {
    products,
    total,
    hasMore,
    page
  };
}

export async function getDealById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      stores (
        id,
        name,
        slug,
        logo_url,
        base_url
      ),
      price_history (
        id,
        price,
        old_price,
        captured_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  const normalized = normalizeDatabaseProduct(data);
  const priceHistory = (data.price_history || []).sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  );

  return {
    ...normalized,
    priceHistory
  };
}

export async function logOutboundClick(productId, source = "deal_card") {
  try {
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id || null;

    await supabase.from("outbound_clicks").insert({
      product_id: productId,
      user_id: userId,
      source
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug("[outbound_click] Telemetry logged error:", err);
  }
}