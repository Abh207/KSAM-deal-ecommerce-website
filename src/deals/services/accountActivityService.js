import { supabase } from "../../lib/supabase.js";
import { getSession, requireAuth } from "../../auth/auth.js";

const RECENT_STORAGE_KEY = "ksam_recently_viewed";

/**
 * Record a product view:
 * - In database via track_product_view RPC if logged in
 * - In localStorage for guest users and local fast cache (max 30)
 */
export async function recordProductView(product) {
  if (!product?.id) return;

  // 1. Update localStorage cache (always, max 30 items)
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    let items = raw ? JSON.parse(raw) : [];
    items = items.filter((item) => item.id !== product.id);
    items.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || product.price,
      discount: product.discount || 0,
      image: product.image,
      store: product.store || "Partner Store",
      category: product.category || "Deals",
      viewed_at: new Date().toISOString()
    });
    if (items.length > 30) {
      items = items.slice(0, 30);
    }
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("[RecentView] LocalStorage write failed:", err);
  }

  // 2. If logged in, call track_product_view RPC
  try {
    const session = await getSession();
    if (session?.user?.id) {
      await supabase.rpc("track_product_view", { p_product_id: product.id });
    }
  } catch (err) {
    // If table or RPC doesn't exist yet, silently ignore
    console.debug("[RecentView] Database tracking notice:", err?.message);
  }
}

/**
 * Get recently viewed products
 */
export async function getRecentlyViewed(userId) {
  let dbProducts = [];

  if (userId) {
    try {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select("viewed_at, products(*)")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        dbProducts = data
          .map((row) => {
            const p = row.products;
            if (!p) return null;
            return {
              id: p.id,
              name: p.title || p.name,
              price: Number(p.price || 0),
              oldPrice: Number(p.original_price || p.oldPrice || p.price || 0),
              discount: p.discount_percent || p.discount || 0,
              image: p.image_url || p.image,
              store: p.retailer || p.store || "Partner Store",
              category: p.category || "Deals",
              viewed_at: row.viewed_at
            };
          })
          .filter(Boolean);
      }
    } catch (err) {
      console.debug("[RecentView] Database fetch notice:", err?.message);
    }
  }

  // Merge with localStorage if DB returned empty
  if (dbProducts.length === 0) {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      return [];
    }
  }

  return dbProducts;
}

/**
 * Clear recently viewed history
 */
export async function clearRecentlyViewed(userId) {
  try {
    localStorage.removeItem(RECENT_STORAGE_KEY);
    if (userId) {
      await supabase.from("recently_viewed").delete().eq("user_id", userId);
    }
    return true;
  } catch (err) {
    console.error("[RecentView] Clear failed:", err);
    return false;
  }
}

/**
 * Fetch all price alerts for user
 */
export async function getPriceAlerts(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.debug("[PriceAlerts] Notice:", error.message);
      return [];
    }

    return (data || []).map((row) => {
      const p = row.products || {};
      const currentPrice = Number(p.price || 0);
      const targetPrice = Number(row.target_price || 0);
      return {
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        target_price: targetPrice,
        is_active: row.is_active,
        created_at: row.created_at,
        triggered_at: row.triggered_at,
        product: {
          id: p.id,
          name: p.title || p.name || "Tracked Product",
          price: currentPrice,
          oldPrice: Number(p.original_price || p.oldPrice || p.price || 0),
          image: p.image_url || p.image,
          store: p.retailer || p.store || "Partner Store",
          url: p.affiliate_url || p.url || ""
        }
      };
    });
  } catch (err) {
    console.error("[PriceAlerts] Fetch error:", err);
    return [];
  }
}

/**
 * Save or update price alert
 */
export async function savePriceAlert(productId, targetPrice) {
  const session = await getSession();
  if (!session?.user?.id) {
    requireAuth({ returnTo: window.location.href });
    return { error: "AUTH_REQUIRED" };
  }

  const numTarget = Number(targetPrice);
  if (!numTarget || numTarget <= 0) {
    return { error: "Please enter a valid target price greater than 0." };
  }

  try {
    const { data, error } = await supabase
      .from("price_alerts")
      .upsert(
        {
          user_id: session.user.id,
          product_id: productId,
          target_price: numTarget,
          is_active: true
        },
        { onConflict: "user_id,product_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (err) {
    console.error("[PriceAlerts] Save error:", err);
    return { error: err.message || "Failed to set price alert." };
  }
}

/**
 * Toggle alert active status
 */
export async function togglePriceAlert(alertId, isActive) {
  try {
    const { error } = await supabase
      .from("price_alerts")
      .update({ is_active: isActive })
      .eq("id", alertId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[PriceAlerts] Toggle error:", err);
    return false;
  }
}

/**
 * Update alert target price
 */
export async function updateAlertTarget(alertId, newTarget) {
  try {
    const { error } = await supabase
      .from("price_alerts")
      .update({ target_price: Number(newTarget) })
      .eq("id", alertId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[PriceAlerts] Update target error:", err);
    return false;
  }
}

/**
 * Delete a price alert
 */
export async function deletePriceAlert(alertId) {
  try {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", alertId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[PriceAlerts] Delete error:", err);
    return false;
  }
}
