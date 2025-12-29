import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface BolsosProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const BolsosProductGrid = ({ products, onProductClick }: BolsosProductGridProps) => {
  // Pattern: (2, 1, 2, 1, 2, 1...) - every 3rd product is featured (full width)
  const isFeatured = (index: number) => {
    // Cycle of 3: indices 0,1 are normal, index 2 is featured
    return index % 3 === 2;
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {products.map((product, index) => {
        const featured = isFeatured(index);
        
        return (
          <div
            key={product.id}
            className={featured ? 'col-span-2' : 'col-span-1'}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              index={index}
              featured={featured}
              hideBrandName
            />
          </div>
        );
      })}
    </div>
  );
};

export default BolsosProductGrid;
