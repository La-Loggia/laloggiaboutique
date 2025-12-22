import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import { Brand, brands } from '@/data/products';
import { useProductsByBrand, Product } from '@/hooks/useProducts';

import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import jottLogo from '@/assets/logo-jott.png';

const brandLogos: Record<Brand, { src: string; height: string }> = {
  'MOOR': { src: moorLogo, height: 'h-[72px]' },
  'SaintTropez': { src: saintTropezLogo, height: 'h-[81px]' },
  'DiLei': { src: dileiLogo, height: 'h-[75px]' },
  'Mela': { src: melaLogo, height: 'h-[93px]' },
  'Pecatto': { src: pecattoLogo, height: 'h-[87px]' },
  'Dixie': { src: dixieLogo, height: 'h-[63px]' },
  'Replay': { src: replayLogo, height: 'h-[74px]' },
  'RueMadam': { src: rueMadamLogo, height: 'h-[75px]' },
  'JOTT': { src: jottLogo, height: 'h-[72px]' },
};

const brandDescriptions: Record<Brand, string> = {
  'MOOR': 'Descubre la colección MOOR en La Loggia. Moda italiana de mujer con estilo elegante y sofisticado disponible en Altea, San Juan y Campello.',
  'SaintTropez': 'Colección SaintTropez en La Loggia. Moda escandinava femenina con diseños actuales en nuestras boutiques de Alicante.',
  'DiLei': 'Moda DiLei en La Loggia. Prendas italianas exclusivas para mujer en Altea, San Juan y Campello.',
  'Mela': 'Colección Mela en La Loggia. Estilo italiano contemporáneo para mujer en nuestras tiendas de Alicante.',
  'Pecatto': 'Descubre Pecatto en La Loggia. Moda femenina con personalidad en Altea, San Juan y Campello.',
  'Dixie': 'Colección Dixie en La Loggia. Moda italiana urbana para mujer en nuestras boutiques de Alicante.',
  'Replay': 'Moda Replay en La Loggia. Denim y casual wear de calidad en Altea, San Juan y Campello.',
  'RueMadam': 'Colección RueMadam en La Loggia. Elegancia parisina para mujer en nuestras tiendas de Alicante.',
  'JOTT': 'JOTT en La Loggia. Plumas y chaquetas ligeras de alta calidad en Altea, San Juan y Campello.',
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
    'ruemadam': 'RueMadam',
    'jott': 'JOTT',
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
      <SEOHead
        title={`${brand} | Moda Mujer en La Loggia Altea, San Juan y Campello`}
        description={brandDescriptions[brand]}
        canonicalPath={`/marca/${brandSlug?.toLowerCase()}`}
      />
      
      <Header />
      <BrandNav activeBrand={brand} />

      <main className="py-6">
        {/* Brand logo with H1 for SEO */}
        <header className="flex flex-col items-center mb-6">
          <h1 className="sr-only">{brand} - Moda mujer en La Loggia</h1>
          <img 
            src={brandLogo.src} 
            alt={`Logo ${brand} - Moda italiana mujer en La Loggia Alicante`} 
            className={`${brandLogo.height} w-auto object-contain grayscale opacity-80`}
          />
        </header>

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
