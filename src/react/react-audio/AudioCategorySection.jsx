import React from "react";
import CategoryTilesSection from "../common/CategoryTilesSection.jsx";

export default function AudioCategorySection({
  categories = [],
  products = [],
  selectedCategory = "All",
  onSelectCategory
}) {
  return (
    <CategoryTilesSection
      categorySlug="audio"
      categoryLabel="Audio"
      products={products}
      selectedSubCategory={selectedCategory}
      onSelectSubCategory={onSelectCategory}
    />
  );
}
