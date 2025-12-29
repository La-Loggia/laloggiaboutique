import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  showBadge?: boolean;
}

const ProductGrid = ({ products, onProductClick, showBadge = false }: ProductGridProps) => {
  // Pattern: 2+2+1 (hero every 5th position: indices 4, 9, 14...)
  // Row 1: products 0-1, Row 2: products 2-3, Row 3: product 4 (hero)
  // Row 4: products 5-6, Row 5: products 7-8, Row 6: product 9 (hero)
  const isHeroPosition = (index: number) => (index + 1) % 5 === 0;

  return (
    <div className="grid grid-cols-2 gap-3 px-3">
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
