import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import { getLatestProducts, Product } from '@/data/products';

const LatestProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const allProducts = getLatestProducts();

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
      <Header />
      <BrandNav />

      <main className="py-6">
        <div className="text-center mb-6">
          <h1 className="section-title">Últimas Novedades</h1>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
        </div>

        <ProductGrid products={allProducts} onProductClick={handleProductClick} />

        <div className="text-center mt-8 pb-8">
          <Link
            to="/"
            className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default LatestProducts;
