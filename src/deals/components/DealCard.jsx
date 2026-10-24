import ProductCard from "./ProductCard.jsx";

/**
 * DealCard is an alias/wrapper around ProductCard for seamless backward compatibility.
 */
function DealCard({ product, onOpenDetails }) {
  return <ProductCard product={product} onOpenDetails={onOpenDetails} />;
}

export default DealCard;
