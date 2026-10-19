import { useSyncExternalStore } from "react";

export const CART_KEY = "cartProductLS";
export const CURRENCY_SYMBOL = "₹";
export const FREE_DELIVERY_THRESHOLD = 999;

export function parsePrice(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatPrice(num) {
  const n = typeof num === "number" ? num : parsePrice(num);
  return `${CURRENCY_SYMBOL}${Math.round(n).toLocaleString("en-IN")}`;
}

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading cart from localStorage:", e);
    return [];
  }
}

function writeStorage(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
}

let memoryCart = readStorage();
const listeners = new Set();

function emitChange() {
  writeStorage(memoryCart);
  for (const listener of listeners) {
    listener();
  }
}

// Sync across multiple tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) {
      memoryCart = readStorage();
      for (const listener of listeners) {
        listener();
      }
    }
  });
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
    if (!product || !product.id) return;
    const priceNum = parsePrice(product.price);
    const oldPriceNum = parsePrice(product.oldPrice);
    const existingIndex = memoryCart.findIndex((item) => String(item.id) === String(product.id));

    if (existingIndex > -1) {
      const existing = memoryCart[existingIndex];
      const newQty = (existing.quantity || existing.qty || 1) + qty;
      memoryCart = memoryCart.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              quantity: newQty,
              qty: newQty
            }
          : item
      );
    } else {
      const newItem = {
        id: product.id,
        name: product.name || "Untitled Product",
        category: product.category || "Deals",
        price: priceNum,
        oldPrice: oldPriceNum,
        image: product.image || "",
        quantity: qty,
        qty: qty,
        store: product.store || ""
      };
      memoryCart = [newItem, ...memoryCart];
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
