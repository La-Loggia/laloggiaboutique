import { Link } from 'react-router-dom';
import { getLatestProducts, Product } from '@/data/products';
import ProductGrid from './ProductGrid';

interface HomeLatestPreviewProps {
  onProductClick: (product: Product) => void;
}

const HomeLatestPreview = ({ onProductClick }: HomeLatestPreviewProps) => {
  const previewProducts = getLatestProducts(6);

  return (
    <section className="py-6">
      <div className="text-center mb-6">
        <h2 className="section-title">Últimas Novedades</h2>
        <div className="w-12 h-px bg-border mx-auto mt-3" />
      </div>

      <ProductGrid products={previewProducts} onProductClick={onProductClick} />

      <div className="text-center mt-8">
        <Link
          to="/novedades"
          className="font-sans text-xs tracking-[0.2em] uppercase text-foreground border border-foreground/20 px-8 py-3 transition-all duration-300 hover:bg-foreground hover:text-background inline-block"
        >
          Ver Más Novedades
        </Link>
      </div>
    </section>
  );
};

export default HomeLatestPreview;
