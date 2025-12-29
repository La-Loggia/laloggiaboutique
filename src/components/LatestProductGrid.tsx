import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface LatestProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const LatestProductGrid = ({ products, onProductClick }: LatestProductGridProps) => {
  const getProductLayout = (index: number) => {
    // Mobile pattern: every 5th product is featured (full width on 2-col grid)
    const mobilePositionInPattern = index % 5;
    const isMobileFeatured = mobilePositionInPattern === 4;
    
    // Desktop pattern:
    // First round: 4 normal + 2 featured (exception: skips one 4-row)
    // Then repeating: 4 + 4 + 2 (10 products per cycle)
    let isDesktopFeatured = false;
    if (index < 6) {
      // First 6 products: indices 0-3 normal (row of 4), indices 4-5 featured (row of 2)
      isDesktopFeatured = index >= 4;
    } else {
      // After first 6: pattern is 4, 4, 2 repeating (10 products per cycle)
      const adjustedIndex = index - 6;
      const positionInCycle = adjustedIndex % 10;
      // Positions 0-3: normal (4 products), 4-7: normal (4 products), 8-9: featured (2 products)
      isDesktopFeatured = positionInCycle >= 8;
    }
    
    return { isMobileFeatured, isDesktopFeatured };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3">
      {products.map((product, index) => {
        const { isMobileFeatured, isDesktopFeatured } = getProductLayout(index);
        
        // Mobile: col-span-2 if featured, col-span-1 otherwise
        // Desktop: md:col-span-2 if featured, md:col-span-1 otherwise
        const colSpanClass = `${isMobileFeatured ? 'col-span-2' : 'col-span-1'} ${isDesktopFeatured ? 'md:col-span-2' : 'md:col-span-1'}`;
        
        return (
          <div
            key={product.id}
            className={colSpanClass}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              index={index}
              featured={isMobileFeatured || isDesktopFeatured}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LatestProductGrid;
