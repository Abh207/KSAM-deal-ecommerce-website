import { supabase } from "../../lib/supabase";

const LS_WISHLIST_KEY = "ksam_guest_wishlist";
const listeners = new Set();

function emitWishlistChange() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      // ignore
    }
  }
}

function getGuestWishlist() {
  try {
    const raw = localStorage.getItem(LS_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setGuestWishlist(ids) {
  try {
    localStorage.setItem(LS_WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export const wishlistService = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async isSaved(productId) {
    if (!productId) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      const guestList = getGuestWishlist();
      return guestList.includes(String(productId));
    }

    const { data } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    return Boolean(data);
  },

  async toggle(product) {
    if (!product || !product.id) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      // Guest mode via localStorage
      const guestList = getGuestWishlist();
      const strId = String(product.id);
      let nextList;
      let isNowSaved = false;
      if (guestList.includes(strId)) {
        nextList = guestList.filter((id) => id !== strId);
        isNowSaved = false;
      } else {
        nextList = [...guestList, strId];
        isNowSaved = true;
      }
      setGuestWishlist(nextList);
      emitWishlistChange();
      return isNowSaved;
    }

    // Authenticated user via Supabase
    const { data: existing } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      emitWishlistChange();
      return false;
    } else {
      await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: product.id
      });
      emitWishlistChange();
      return true;
    }
  }
};
