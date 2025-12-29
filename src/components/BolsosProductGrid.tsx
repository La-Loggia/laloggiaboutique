import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface BolsosProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const BolsosProductGrid = ({ products, onProductClick }: BolsosProductGridProps) => {
  const getProductLayout = (index: number) => {
    // Mobile pattern: (3, 2, 3, 3, 2) with exception in first round
    // First round: 3 + 2 (5 products)
    // Then repeating: 3 + 3 + 2 (8 products per cycle)
    let isMobileFeatured = false;
    if (index < 5) {
      // First 5 products: indices 0-2 normal (row of 3), indices 3-4 featured (row of 2)
      isMobileFeatured = index >= 3;
    } else {
      // After first 5: pattern is 3, 3, 2 repeating (8 products per cycle)
      const adjustedIndex = index - 5;
      const positionInCycle = adjustedIndex % 8;
      // Positions 0-2: normal (3 products), 3-5: normal (3 products), 6-7: featured (2 products)
      isMobileFeatured = positionInCycle >= 6;
    }
    
    // Desktop pattern (same as ProductGrid):
    // First round: 4 normal + 2 featured
    // Then repeating: 4 + 4 + 2 (10 products per cycle)
    let isDesktopFeatured = false;
    if (index < 6) {
      isDesktopFeatured = index >= 4;
    } else {
      const adjustedIndex = index - 6;
      const positionInCycle = adjustedIndex % 10;
      isDesktopFeatured = positionInCycle >= 8;
    }
    
    return { isMobileFeatured, isDesktopFeatured };
  };

  return (
    <div className="grid grid-cols-6 md:grid-cols-4 gap-3 px-3">
      {products.map((product, index) => {
        const { isMobileFeatured, isDesktopFeatured } = getProductLayout(index);
        
        // Mobile: col-span-3 if featured (2 per row), col-span-2 otherwise (3 per row)
        // Desktop: md:col-span-2 if featured, md:col-span-1 otherwise
        const mobileColSpan = isMobileFeatured ? 'col-span-3' : 'col-span-2';
        const desktopColSpan = isDesktopFeatured ? 'md:col-span-2' : 'md:col-span-1';
        
        return (
          <div
            key={product.id}
            className={`${mobileColSpan} ${desktopColSpan}`}
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

export default BolsosProductGrid;
