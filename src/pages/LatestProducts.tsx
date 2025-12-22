import { useState } from 'react';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Últimas Novedades en Moda Mujer | La Loggia Altea, San Juan y Campello"
        description="Descubre las últimas novedades en moda femenina de La Loggia. Nuevas colecciones de MOOR, SaintTropez, DiLei y más marcas italianas en nuestras tiendas de Alicante."
        canonicalPath="/novedades"
      />
      
      <Header />
      <BrandNav />

      <main className="py-6">
        <div className="text-center mb-6">
          <h1 className="section-title">Últimas Novedades</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2">
            Nuevas llegadas a La Loggia
          </p>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : allProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay novedades disponibles</p>
        ) : (
          <ProductGrid products={allProducts} onProductClick={handleProductClick} />
        )}
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default LatestProducts;
