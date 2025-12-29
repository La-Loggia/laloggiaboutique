import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  showBadge?: boolean;
}

const ProductGrid = ({ products, onProductClick, showBadge = false }: ProductGridProps) => {
  // Every 5th product (index 4, 9, 14...) becomes a hero
  const isHeroPosition = (index: number) => (index + 1) % 5 === 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick ? () => onProductClick(product) : undefined}
          index={index}
          isHero={isHeroPosition(index)}
          showBadge={showBadge}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
