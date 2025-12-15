import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import { Brand, brands, getProductsByBrand, Product } from '@/data/products';

const BrandPage = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Map slug to brand name
  const brandMap: Record<string, Brand> = {
    'moor': 'MOOR',
    'sainttropez': 'SaintTropez',
    'dilei': 'DiLei',
    'mela': 'Mela',
    'pecatto': 'Pecatto',
  };

  const brand = brandSlug ? brandMap[brandSlug.toLowerCase()] : null;

  if (!brand || !brands.includes(brand)) {
    return <Navigate to="/" replace />;
  }

  const products = getProductsByBrand(brand);

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
      <BrandNav activeBrand={brand} />

      <main className="py-8">
        <div className="text-center mb-6">
          <h1 className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground">
            {brand}
          </h1>
          <div className="w-8 h-px bg-border mx-auto mt-3" />
        </div>

        <ProductGrid products={products} onProductClick={handleProductClick} />

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

export default BrandPage;
