import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface LatestProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const LatestProductGrid = ({ products, onProductClick }: LatestProductGridProps) => {
  // Pattern: 4 normal products (2x2), then 1 featured (full width)
  // Repeats every 5 products
  const getProductLayout = (index: number) => {
    const positionInPattern = index % 5;
    return positionInPattern === 4 ? 'featured' : 'normal';
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {products.map((product, index) => {
        const layout = getProductLayout(index);
        
        return (
          <div
            key={product.id}
            className={layout === 'featured' ? 'col-span-2' : 'col-span-1'}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              index={index}
              featured={layout === 'featured'}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LatestProductGrid;
