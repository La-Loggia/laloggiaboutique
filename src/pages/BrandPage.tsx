import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import { Brand, brands } from '@/data/products';
import { useProductsByBrand, Product } from '@/hooks/useProducts';

import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';

const brandLogos: Record<Brand, { src: string; height: string }> = {
  'MOOR': { src: moorLogo, height: 'h-[36px]' },
  'SaintTropez': { src: saintTropezLogo, height: 'h-[40px]' },
  'DiLei': { src: dileiLogo, height: 'h-[38px]' },
  'Mela': { src: melaLogo, height: 'h-[46px]' },
  'Pecatto': { src: pecattoLogo, height: 'h-[44px]' },
  'Dixie': { src: dixieLogo, height: 'h-[32px]' },
  'Replay': { src: replayLogo, height: 'h-[37px]' },
};

const BrandPage = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const brandMap: Record<string, Brand> = {
    'moor': 'MOOR',
    'sainttropez': 'SaintTropez',
    'dilei': 'DiLei',
    'mela': 'Mela',
    'pecatto': 'Pecatto',
    'dixie': 'Dixie',
    'replay': 'Replay',
  };

  const brand = brandSlug ? brandMap[brandSlug.toLowerCase()] : null;

  if (!brand || !brands.includes(brand)) {
    return <Navigate to="/" replace />;
  }

  const { data: products = [], isLoading } = useProductsByBrand(brand);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewer = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
  };

  const brandLogo = brandLogos[brand];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BrandNav activeBrand={brand} />

      <main className="py-6">
        {/* Brand logo instead of text */}
        <div className="flex justify-center mb-6">
          <img 
            src={brandLogo.src} 
            alt={brand} 
            className={`${brandLogo.height} w-auto object-contain grayscale opacity-80`}
          />
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay prendas de esta marca</p>
        ) : (
          <ProductGrid products={products} onProductClick={handleProductClick} />
        )}
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default BrandPage;
