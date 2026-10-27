import { useSyncExternalStore } from "react";
import {
  CART_STORAGE_KEY,
  CURRENCY_SYMBOL,
  FREE_DELIVERY_THRESHOLD,
  parsePrice,
  formatPrice,
  normalizeCartItem,
  getNormalizedCart
} from "../../lib/cartHelper.js";

export const CART_KEY = CART_STORAGE_KEY;
export { CURRENCY_SYMBOL, FREE_DELIVERY_THRESHOLD, parsePrice, formatPrice };

function readStorage() {
  return getNormalizedCart();
}

let isWritingInternal = false;

function writeStorage(items) {
  if (typeof window === "undefined") return;
  try {
    isWritingInternal = true;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  } finally {
    isWritingInternal = false;
  }
}

let memoryCart = readStorage();
const listeners = new Set();

function emitChange() {
  writeStorage(memoryCart);
  for (const listener of listeners) {
    listener();
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

// Sync across multiple tabs, same-window localStorage changes, and custom events
if (typeof window !== "undefined") {
  const syncCart = () => {
    if (isWritingInternal) return;
    const fresh = readStorage();
    if (JSON.stringify(fresh) !== JSON.stringify(memoryCart)) {
      memoryCart = fresh;
      for (const listener of listeners) {
        listener();
      }
    }
  };

  window.addEventListener("storage", (e) => {
    if (!e.key || e.key === CART_KEY) syncCart();
  });
  window.addEventListener("cartUpdated", syncCart);
  window.addEventListener("focus", syncCart);

  // Same-window bridge: safely update cartStore whenever category pages write to cartProductLS
  try {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, val) {
      origSetItem(key, val);
      if (key === CART_KEY && !isWritingInternal) {
        syncCart();
      }
    };
  } catch (e) {
    // ignore if localStorage is restricted
  }
}

export const cartStore = {
  getItems() {
    return memoryCart;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  add(product, qty = 1) {
    if (!product || product.id === undefined || product.id === null) return;
    const normalized = normalizeCartItem(product, qty);
    if (!normalized || !normalized.id) return;

    const existingIndex = memoryCart.findIndex(
      (item) => String(item.id) === String(normalized.id)
    );

    if (existingIndex > -1) {
      const existing = memoryCart[existingIndex];
      const newQty = (existing.quantity || existing.qty || 1) + normalized.quantity;
      memoryCart = memoryCart.map((item, idx) =>
        idx === existingIndex
          ? {
              ...existing,
              ...normalized,
              quantity: newQty,
              qty: newQty
            }
          : item
      );
    } else {
      memoryCart = [normalized, ...memoryCart];
    }
    emitChange();
  },

  setQty(id, qty) {
    const targetQty = Math.max(0, parseInt(qty, 10) || 0);
    if (targetQty === 0) {
      this.remove(id);
      return;
    }
    memoryCart = memoryCart.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            quantity: targetQty,
            qty: targetQty
          }
        : item
    );
    emitChange();
  },

  remove(id) {
    memoryCart = memoryCart.filter((item) => String(item.id) !== String(id));
    emitChange();
  },

  clear() {
    memoryCart = [];
    emitChange();
  }
};

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getItems,
    () => []
  );

  const count = items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0);

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || item.qty || 1);
    return sum + price * qty;
  }, 0);

  const savings = items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const oldPrice = Number(item.oldPrice || 0);
    const qty = Number(item.quantity || item.qty || 1);
    if (oldPrice > price) {
      return sum + (oldPrice - price) * qty;
    }
    return sum;
  }, 0);

  return {
    items,
    count,
    subtotal,
    savings,
    add: (prod, qty) => cartStore.add(prod, qty),
    setQty: (id, qty) => cartStore.setQty(id, qty),
    remove: (id) => cartStore.remove(id),
    clear: () => cartStore.clear()
  };
}
