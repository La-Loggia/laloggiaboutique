import { useState } from 'react';
import { getLatestProducts, Product } from '@/data/products';
import ProductGrid from './ProductGrid';

interface LatestSectionProps {
  onProductClick: (product: Product) => void;
}

const LatestSection = ({ onProductClick }: LatestSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const allProducts = getLatestProducts();
  const displayedProducts = showAll ? allProducts : allProducts.slice(0, 6);

  return (
    <section className="py-6">
      <div className="text-center mb-6">
        <h2 className="section-title">Últimas Novedades</h2>
        <div className="w-12 h-px bg-border mx-auto mt-3" />
      </div>

      <ProductGrid products={displayedProducts} onProductClick={onProductClick} />

      {!showAll && allProducts.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="font-sans text-xs tracking-[0.2em] uppercase text-foreground border border-foreground/20 px-8 py-3 transition-all duration-300 hover:bg-foreground hover:text-background"
          >
            Ver Más Novedades
          </button>
        </div>
      )}

      {showAll && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(false)}
            className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver
          </button>
        </div>
      )}
    </section>
  );
};

export default LatestSection;
