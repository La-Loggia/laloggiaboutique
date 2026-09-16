import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import { useSaleProducts, Product } from '@/hooks/useProducts';

const SaleProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: products = [], isLoading } = useSaleProducts();
  const savedScrollPosition = useRef<number>(0);
  const hasScrolledToTop = useRef(false);

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

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Rebajas', url: '/rebajas' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Rebajas Moda Mujer | La Loggia Altea, San Juan, Campello"
        description="Rebajas en moda italiana de mujer en La Loggia. Prendas seleccionadas de MOOR, Saint Tropez, DiLei, Dixie y más marcas europeas en nuestras boutiques de Altea, San Juan y Campello."
        canonicalPath="/rebajas"
        breadcrumbs={breadcrumbs}
      />

      <Header />

      <main className="py-6">
        <header className="text-center mb-6">
          <h1 className="section-title">Rebajas</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2">
            Selección de prendas rebajadas en La Loggia
          </p>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Ahora mismo no hay prendas en rebajas</p>
        ) : (
          <ProductGrid products={products} onProductClick={handleProductClick} />
        )}
      </main>

      {selectedProduct && (
        <ImageViewer
          product={selectedProduct}
          onClose={handleCloseViewer}
          onProductClick={handleProductClick}
        />
      )}
    </div>
  );
};

export default SaleProducts;
