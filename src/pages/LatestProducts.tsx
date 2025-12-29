import { useState } from 'react';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import LatestProductGrid from '@/components/LatestProductGrid';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import { useLatestProducts, Product } from '@/hooks/useProducts';

const LatestProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: allProducts = [], isLoading } = useLatestProducts();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewer = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
  };

  // Breadcrumbs for structured navigation
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Novedades', url: '/novedades' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Novedades Moda Mujer | La Loggia Altea, San Juan, Campello"
        description="Últimas novedades en moda femenina italiana de La Loggia. Nuevas colecciones MOOR, Saint Tropez, DiLei, Dixie y más marcas europeas. Boutiques en Altea, San Juan y Campello."
        canonicalPath="/novedades"
        breadcrumbs={breadcrumbs}
      />
      
      <Header />
      <BrandNav />

      <main className="py-6">
        <header className="text-center mb-6">
          <h1 className="section-title">Últimas Novedades</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2">
            Nuevas llegadas a La Loggia
          </p>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
          
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : allProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay novedades disponibles</p>
        ) : (
          <LatestProductGrid products={allProducts} onProductClick={handleProductClick} />
        )}
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default LatestProducts;
