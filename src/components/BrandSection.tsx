import { Brand, getProductsByBrand, Product } from '@/data/products';
import ProductGrid from './ProductGrid';
import { forwardRef } from 'react';

interface BrandSectionProps {
  brand: Brand;
  onProductClick: (product: Product) => void;
}

const BrandSection = forwardRef<HTMLElement, BrandSectionProps>(
  ({ brand, onProductClick }, ref) => {
    const products = getProductsByBrand(brand);

    return (
      <section ref={ref} id={`brand-${brand}`} className="py-8">
        <div className="text-center mb-6">
          <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground">
            {brand}
          </h2>
          <div className="w-8 h-px bg-border mx-auto mt-3" />
        </div>
        <ProductGrid products={products} onProductClick={onProductClick} />
      </section>
    );
  }
);

BrandSection.displayName = 'BrandSection';

export default BrandSection;
