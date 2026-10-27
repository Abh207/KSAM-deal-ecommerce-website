import {
  isInWishlist,
  toggleWishlist,
  subscribeWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} from "../../lib/wishlist.js";

/**
 * Compatibility bridge redirecting legacy wishlistService calls
 * to the unified src/lib/wishlist.js module.
 */
export const wishlistService = {
  subscribe(listener) {
    return subscribeWishlist(() => {
      try {
        listener();
      } catch {}
    });
  },

  async isSaved(productId) {
    return isInWishlist(productId);
  },

  async toggle(product) {
    return toggleWishlist(product);
  },

  async remove(productId) {
    return removeFromWishlist(productId);
  },

  async clear() {
    return clearWishlist();
  },

  getAll() {
    return getWishlist();
  }
};

export default wishlistService;
