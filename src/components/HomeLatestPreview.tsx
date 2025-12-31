import { Link } from 'react-router-dom';
import { useLatestProducts, Product } from '@/hooks/useProducts';
import ProductGrid from './ProductGrid';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeLatestPreviewProps {
  onProductClick: (product: Product) => void;
}

const HomeLatestPreview = ({ onProductClick }: HomeLatestPreviewProps) => {
  const isMobile = useIsMobile();
  // Fetch 7 products, show all on mobile, 6 on desktop
  const { data: allProducts = [], isLoading } = useLatestProducts(7);
  const previewProducts = isMobile ? allProducts : allProducts.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </section>
    );
  }

  if (previewProducts.length === 0) {
    return (
      <section className="py-6">
        <div className="text-center mb-6">
          <h2 className="section-title">Últimas Novedades</h2>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
        </div>
        <p className="text-center text-muted-foreground">No hay novedades disponibles</p>
      </section>
    );
  }

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
