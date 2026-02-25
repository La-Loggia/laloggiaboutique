import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import { useAdminContext } from '@/contexts/AdminContext';
import EditableProductGrid from '@/components/EditableProductGrid';
import { ArrowLeft } from 'lucide-react';
import { useProductsByCategory, Product } from '@/hooks/useProducts';

const Camisetas = () => {
  const navigate = useNavigate();
  const { isEditMode } = useAdminContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const savedScrollPosition = useRef<number>(0);
  const hasScrolledToTop = useRef(false);

  const { data: products = [], isLoading } = useProductsByCategory('camisetas');

  useEffect(() => {
    if (!hasScrolledToTop.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      hasScrolledToTop.current = true;
    }
  }, []);

  const handleProductClick = (product: Product) => {
    savedScrollPosition.current = window.scrollY;
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewer = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollPosition.current, behavior: 'instant' });
    });
  };

  return (
    <>
      <SEOHead
        title="Camisetas en La Loggia | Moda mujer Alicante"
        description="Descubre nuestra colección de camisetas de las mejores marcas en La Loggia. Tiendas en Altea, San Juan y Campello."
        canonicalPath="/camisetas"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
          <div className="flex items-center px-4 py-2.5">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs tracking-[0.15em] uppercase">Volver</span>
            </button>
          </div>
        </nav>
        <main className="py-6">
          <header className="text-center mb-6">
            <h1 className="section-title">Camisetas</h1>
            <div className="w-12 h-px bg-border mx-auto mt-3" />
          </header>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No hay productos disponibles en esta categoría.</div>
          ) : isEditMode ? (
            <EditableProductGrid products={products} onProductClick={handleProductClick} />
          ) : (
            <ProductGrid products={products} onProductClick={handleProductClick} />
          )}
        </main>
        {selectedProduct && (
          <ImageViewer product={selectedProduct} onClose={handleCloseViewer} onProductClick={handleProductClick} />
        )}
      </div>
    </>
  );
};

export default Camisetas;
