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

// SEO-optimized brand metadata
const brandSEO: Record<Brand, { 
  title: string; 
  description: string; 
  h1: string;
  origin: string;
  style: string;
}> = {
  'MOOR': {
    title: 'MOOR Milano | Moda Italiana Mujer en La Loggia Alicante',
    description: 'Colección MOOR Milano en La Loggia. Moda italiana femenina elegante y sofisticada. Vestidos, blusas y prendas exclusivas en Altea, San Juan y Campello.',
    h1: 'MOOR Milano – Moda italiana femenina en La Loggia',
    origin: 'Milán, Italia',
    style: 'Elegancia sofisticada con líneas puras y tejidos de alta calidad. Prendas atemporales para la mujer moderna.'
  },
  'SaintTropez': {
    title: 'Saint Tropez Copenhagen | Moda Escandinava en La Loggia',
    description: 'Saint Tropez Copenhagen en La Loggia. Diseños escandinavos frescos y actuales para mujer. Colecciones exclusivas en nuestras boutiques de Alicante.',
    h1: 'Saint Tropez Copenhagen – Estilo escandinavo en La Loggia',
    origin: 'Copenhague, Dinamarca',
    style: 'Diseño escandinavo minimalista con toques bohemios. Prendas versátiles y femeninas para el día a día.'
  },
  'DiLei': {
    title: 'DiLei | Moda Italiana Exclusiva en La Loggia Alicante',
    description: 'DiLei en La Loggia. Prendas italianas exclusivas con estilo mediterráneo. Moda femenina de calidad en Altea, San Juan y Campello.',
    h1: 'DiLei – Prendas italianas exclusivas en La Loggia',
    origin: 'Italia',
    style: 'Estilo italiano auténtico con tejidos premium. Colecciones que combinan tradición artesanal y tendencias actuales.'
  },
  'Mela': {
    title: 'Mela London | Moda Contemporánea Mujer en La Loggia',
    description: 'Mela London en La Loggia. Estilo contemporáneo británico para mujer. Vestidos y prendas con personalidad en nuestras tiendas de Alicante.',
    h1: 'Mela London – Estilo británico contemporáneo en La Loggia',
    origin: 'Londres, Reino Unido',
    style: 'Moda británica con estampados vibrantes y siluetas favorecedoras. Prendas con carácter para ocasiones especiales.'
  },
  'Pecatto': {
    title: 'Pecatto | Moda Femenina con Personalidad en La Loggia',
    description: 'Pecatto en La Loggia. Moda femenina con carácter y estilo propio. Colecciones exclusivas en Altea, San Juan y Campello, Alicante.',
    h1: 'Pecatto – Moda con personalidad en La Loggia',
    origin: 'Europa',
    style: 'Prendas con personalidad que destacan. Diseños atrevidos para mujeres que quieren expresar su estilo único.'
  },
  'Dixie': {
    title: 'Dixie | Moda Urbana Italiana Mujer en La Loggia Alicante',
    description: 'Dixie en La Loggia. Moda urbana italiana para mujer. Estilo casual-chic en nuestras boutiques de Altea, San Juan y Campello.',
    h1: 'Dixie – Moda urbana italiana en La Loggia',
    origin: 'Italia',
    style: 'Estilo urbano italiano con influencias contemporáneas. Prendas cómodas y elegantes para el día a día.'
  },
  'Replay': {
    title: 'Replay | Denim y Casual Wear Premium en La Loggia',
    description: 'Replay en La Loggia. Denim italiano de calidad premium y casual wear. Jeans y prendas icónicas en Altea, San Juan y Campello.',
    h1: 'Replay – Denim premium italiano en La Loggia',
    origin: 'Italia',
    style: 'Denim de alta calidad con lavados exclusivos. La referencia italiana en jeans y moda casual premium.'
  },
  'RueMadam': {
    title: 'Rue Madam | Elegancia Parisina en La Loggia Alicante',
    description: 'Rue Madam en La Loggia. Elegancia francesa para mujer. Estilo parisino sofisticado en nuestras tiendas de Altea, San Juan y Campello.',
    h1: 'Rue Madam – Elegancia parisina en La Loggia',
    origin: 'París, Francia',
    style: 'Sofisticación francesa con toques románticos. Prendas elegantes que capturan la esencia del estilo parisino.'
  },
  'JOTT': {
    title: 'JOTT | Plumas y Chaquetas Técnicas en La Loggia Alicante',
    description: 'JOTT (Just Over The Top) en La Loggia. Plumas ultraligeras y chaquetas técnicas de alta calidad. Disponible en Altea, San Juan y Campello.',
    h1: 'JOTT – Plumas ultraligeras de alta gama en La Loggia',
    origin: 'Francia',
    style: 'Plumas ultraligeras con tecnología premium. Chaquetas técnicas que combinan funcionalidad y estilo.'
  },
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
  const seo = brandSEO[brand];

  // Breadcrumbs for structured navigation
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: brand, url: `/marca/${brandSlug?.toLowerCase()}` }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonicalPath={`/marca/${brandSlug?.toLowerCase()}`}
        breadcrumbs={breadcrumbs}
      />
      
      <Header />
      <BrandNav activeBrand={brand} />

      <main className="py-6">
        {/* Brand header with semantic SEO content */}
        <header className="flex flex-col items-center mb-6">
          <h1 className="sr-only">{seo.h1}</h1>
          <img 
            src={brandLogo.src} 
            alt={`Logo ${brand} - Moda italiana mujer en La Loggia Alicante`} 
            className={`${brandLogo.height} w-auto object-contain grayscale opacity-80`}
          />
          
          {/* Hidden SEO content about the brand */}
          <div className="sr-only">
            <p>Origen: {seo.origin}</p>
            <p>{seo.style}</p>
            <p>
              Descubre la colección {brand} en las boutiques La Loggia de Altea, 
              San Juan de Alicante y El Campello. Moda femenina italiana y europea 
              de calidad en la Costa Blanca.
            </p>
          </div>
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
