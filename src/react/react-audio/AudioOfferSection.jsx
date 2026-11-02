import React from "react";
import FlashSaleBanner from "../common/FlashSaleBanner.jsx";

export default function AudioOfferSection({
  currentOffer,
  products = [],
  scrollToProducts,
  getImagePath
}) {
  return (
    <FlashSaleBanner
      categorySlug="audio"
      categoryLabel="Audio"
      products={products}
      currentOffer={currentOffer}
      scrollToProducts={scrollToProducts}
      getImagePath={getImagePath}
    />
  );
}
