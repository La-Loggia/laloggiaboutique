import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import BolsosImageViewer from '@/components/BolsosImageViewer';
import SEOHead from '@/components/SEOHead';
import { Product } from '@/hooks/useProducts';
import { useBolsosByBrand, BolsoBrand } from '@/hooks/useBolsos';

import replayLogo from '@/assets/logo-replay.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import lolaCasademuntLogo from '@/assets/logo-lolacasademunt.png';

const brandLogos: Record<BolsoBrand, { src: string; height: string }> = {
  'Replay': { src: replayLogo, height: 'h-[74px]' },
  'RueMadam': { src: rueMadamLogo, height: 'h-[75px]' },
  'LolaCasademunt': { src: lolaCasademuntLogo, height: 'h-[72px]' },
};

const brandSEO: Record<BolsoBrand, { 
  title: string; 
  description: string; 
  h1: string;
  displayName: string;
}> = {
  'Replay': {
    title: 'Bolsos Replay | Bolsos Italianos en La Loggia Alicante',
    description: 'Bolsos Replay en La Loggia. Diseño italiano con carácter urbano. Bolsos para mujer en Altea, San Juan y Campello.',
    h1: 'Bolsos Replay – Diseño italiano urbano',
    displayName: 'Replay',
  },
  'RueMadam': {
    title: 'Bolsos Rue Madam Paris | Elegancia Parisina en La Loggia',
    description: 'Bolsos Rue Madam Paris en La Loggia. Elegancia parisina atemporal para mujer. Bolsos en Altea, San Juan y Campello.',
    h1: 'Bolsos Rue Madam Paris – Elegancia parisina',
    displayName: 'Rue Madam Paris',
  },
  'LolaCasademunt': {
    title: 'Bolsos Lola Casademunt | Estilo Español en La Loggia',
    description: 'Bolsos Lola Casademunt en La Loggia. Estilo español con personalidad. Bolsos para mujer en Altea, San Juan y Campello.',
    h1: 'Bolsos Lola Casademunt – Estilo español',
    displayName: 'Lola Casademunt',
  },
};

const BolsosBrandPage = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const brandMap: Record<string, BolsoBrand> = {
    'replay': 'Replay',
    'rue-madam': 'RueMadam',
    'lola-casademunt': 'LolaCasademunt',
  };

  const brand = brandSlug ? brandMap[brandSlug.toLowerCase()] : null;

  if (!brand) {
    return <Navigate to="/" replace />;
  }

  const { data: products = [], isLoading } = useBolsosByBrand(brand);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewer = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
  };

  const brandLogo = brandLogos[brand];
  const seo = brandSEO[brand];

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Bolsos', url: '#' },
    { name: seo.displayName, url: `/bolsos/${brandSlug?.toLowerCase()}` }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonicalPath={`/bolsos/${brandSlug?.toLowerCase()}`}
        breadcrumbs={breadcrumbs}
      />
      
      <Header />

      <main className="py-6">
        {/* Brand header */}
        <header className="flex flex-col items-center mb-6">
          <h1 className="sr-only">{seo.h1}</h1>
          <img 
            src={brandLogo.src} 
            alt={`Logo ${seo.displayName} - Bolsos en La Loggia Alicante`} 
            className={`${brandLogo.height} w-auto object-contain grayscale opacity-80`}
          />
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay bolsos disponibles de esta marca</p>
        ) : (
          <ProductGrid products={products} onProductClick={handleProductClick} />
        )}
      </main>

      {selectedProduct && (
        <BolsosImageViewer 
          product={selectedProduct} 
          onClose={handleCloseViewer} 
          onProductClick={handleProductClick}
        />
      )}
    </div>
  );
};

export default BolsosBrandPage;
