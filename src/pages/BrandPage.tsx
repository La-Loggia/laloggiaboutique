import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import EditableProductGrid from '@/components/EditableProductGrid';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import { Brand, brands } from '@/data/products';
import { useProductsByBrand, Product } from '@/hooks/useProducts';
import { getBrandDisplayName } from '@/lib/brandUtils';

import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import jottLogo from '@/assets/logo-jott.png';
import lolaCasademuntLogo from '@/assets/logo-lolacasademunt.png';
import vicoloLogo from '@/assets/logo-vicolo.png';

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
  'LolaCasademunt': { src: lolaCasademuntLogo, height: 'h-[72px]' },
  'Vicolo': { src: vicoloLogo, height: 'h-[72px]' },
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
    title: 'DIXIE | Moda Femenina Italiana para Mujer en La Loggia Alicante',
    description: 'Dixie en La Loggia. Moda italiana femenina: vestidos, blazers, pantalones y jeans. Boutique Dixie en Altea, San Juan y Campello, Alicante.',
    h1: 'DIXIE – Moda femenina italiana para mujer en La Loggia',
    origin: 'Italia',
    style: 'Dixie es una marca italiana de moda femenina reconocida por su estilo elegante, femenino y con inspiración retro. Originaria de Italia, Dixie destaca por sus colecciones de vestidos, blazers, pantalones, jeans y prendas de punto diseñadas para mujeres que buscan moda con personalidad y carácter. En La Loggia seleccionamos prendas Dixie para mujer que reflejan el espíritu de la marca: diseños cuidados, siluetas femeninas y una estética que combina tradición italiana y tendencias actuales. Las colecciones Dixie incluyen vestidos femeninos, chaquetas y americanas, pantalones, jeans y prendas versátiles pensadas tanto para el día a día como para ocasiones especiales. La moda Dixie se caracteriza por su atención al detalle, la calidad de los tejidos y un estilo atemporal que convierte cada prenda en una pieza clave del armario femenino. En La Loggia apostamos por Dixie como una de nuestras marcas de referencia dentro de la moda italiana para mujer.'
  },
  'Replay': {
    title: 'Replay | Moda Italiana para Mujer en La Loggia Alicante',
    description: 'Replay en La Loggia. Marca italiana de denim premium y moda casual urbana para mujer. Vaqueros y prendas versátiles en Altea, San Juan y Campello.',
    h1: 'Replay – Moda italiana para mujer en La Loggia',
    origin: 'Italia',
    style: 'Replay es una marca italiana de moda reconocida internacionalmente por su especialización en denim de alta calidad y prendas casual de estilo urbano. Fundada en Italia, Replay destaca por su diseño contemporáneo, la durabilidad de sus tejidos y una estética atemporal que combina innovación y tradición. En La Loggia seleccionamos prendas Replay para mujer que encajan con un estilo de vida moderno, ofreciendo vaqueros, prendas casual y propuestas versátiles pensadas para el día a día. Replay es sinónimo de moda italiana con carácter, calidad y personalidad, ideal para mujeres que buscan prendas duraderas sin renunciar al diseño. Las colecciones Replay disponibles en La Loggia reflejan el equilibrio entre moda urbana y elegancia informal, con especial atención al detalle y a los acabados.'
  },
  'RueMadam': {
    title: 'Rue Madam | Bolsos para Mujer en La Loggia Alicante',
    description: 'Bolsos Rue Madam para mujer en La Loggia. Diseños elegantes y funcionales. Bolsos de mano y modelos versátiles en Altea, San Juan y Campello.',
    h1: 'Rue Madam – Bolsos para mujer en La Loggia',
    origin: 'Europa',
    style: 'Rue Madam es una marca reconocida por sus bolsos para mujer con un diseño cuidado y un estilo femenino y elegante. Sus colecciones destacan por la atención al detalle, la funcionalidad y una estética pensada para complementar tanto looks diarios como ocasiones especiales. En La Loggia seleccionamos exclusivamente bolsos Rue Madam para mujer, apostando por modelos versátiles que combinan diseño, calidad y practicidad. Nuestra selección incluye bolsos ideales para el día a día, bolsos de mano y diseños pensados para aportar un toque distintivo a cualquier conjunto. Los bolsos Rue Madam se caracterizan por su estilo atemporal y su facilidad para integrarse en diferentes estilos, convirtiéndose en un complemento esencial para mujeres que buscan elegancia y funcionalidad en un solo accesorio.'
  },
  'JOTT': {
    title: 'JOTT | Plumíferos y Chaquetas Ligeras para Mujer en La Loggia Alicante',
    description: 'JOTT en La Loggia. Plumíferos ligeros, chaquetas de plumas y chalecos acolchados para mujer. Moda francesa en Altea, San Juan y Campello.',
    h1: 'JOTT – Plumíferos y chaquetas ligeras para mujer en La Loggia',
    origin: 'Francia',
    style: 'JOTT (Just Over The Top) es una marca francesa reconocida internacionalmente por sus plumíferos ligeros, chaquetas de plumas y chalecos acolchados para mujer. Sus prendas destacan por ser ultraligeras, funcionales y fáciles de transportar, convirtiéndose en una referencia dentro de la moda urbana contemporánea. En La Loggia seleccionamos prendas JOTT para mujer como plumíferos, chalecos acolchados y chaquetas ligeras, ideales para el día a día y para climas suaves como el de Alicante. Las colecciones JOTT combinan diseño francés, comodidad y practicidad, ofreciendo prendas versátiles que se adaptan tanto a looks casuales como urbanos. Los abrigos ligeros, chaquetas de plumas y chalecos JOTT destacan por su estilo limpio, su ligereza y su facilidad para plegarse y transportarse, convirtiéndose en una opción perfecta para mujeres que buscan funcionalidad sin renunciar al diseño.'
  },
  'LolaCasademunt': {
    title: 'Lola Casademunt | Moda Femenina y Bolsos en La Loggia Alicante',
    description: 'Lola Casademunt en La Loggia. Moda femenina española con estilo sofisticado y bolsos con personalidad. Ropa y complementos en Altea, San Juan y Campello.',
    h1: 'Lola Casademunt – Moda femenina y bolsos con estilo propio',
    origin: 'España',
    style: 'Lola Casademunt es una marca de moda femenina reconocida por su estilo sofisticado, femenino y lleno de personalidad. Sus colecciones destacan por el uso de diseños actuales, colores cuidados y detalles que aportan carácter a cada prenda. En La Loggia encontrarás una selección de ropa y bolsos Lola Casademunt pensada para mujeres que buscan un estilo elegante, actual y con identidad propia. La marca combina moda urbana, tendencia y calidad, ofreciendo piezas versátiles ideales tanto para el día a día como para ocasiones especiales. La colección de Lola Casademunt disponible en La Loggia incluye bolsos y prendas seleccionadas que reflejan el espíritu creativo y femenino de la marca, convirtiéndola en una referencia dentro de la moda femenina actual.'
  },
  'Vicolo': {
    title: 'Vicolo | Moda Italiana Femenina en La Loggia Alicante',
    description: 'Vicolo en La Loggia. Moda italiana femenina con estilo urbano y contemporáneo. Vestidos, tops y prendas con personalidad en Altea, San Juan y Campello.',
    h1: 'Vicolo – Moda italiana urbana y femenina en La Loggia',
    origin: 'Italia',
    style: 'Vicolo es una marca italiana de moda femenina reconocida por su estilo urbano, fresco y contemporáneo. Sus colecciones destacan por combinar tendencias actuales con un toque femenino y versátil, ofreciendo prendas ideales tanto para el día a día como para ocasiones especiales. En La Loggia seleccionamos piezas Vicolo que reflejan el espíritu creativo de la marca italiana.'
  },
};

const BrandPage = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const savedScrollPosition = useRef<number>(0);
  const hasScrolledToTop = useRef(false);

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
    'lolacasademunt': 'LolaCasademunt',
    'vicolo': 'Vicolo',
  };

  const brand = brandSlug ? brandMap[brandSlug.toLowerCase()] : null;

  // Scroll to top on mount (only once per page load)
  useEffect(() => {
    if (!hasScrolledToTop.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      hasScrolledToTop.current = true;
    }
  }, []);

  // Reset scroll flag when brand changes
  useEffect(() => {
    hasScrolledToTop.current = false;
  }, [brandSlug]);

  if (!brand || !brands.includes(brand)) {
    return <Navigate to="/" replace />;
  }

  const { data: products = [], isLoading } = useProductsByBrand(brand);

  const handleProductClick = (product: Product) => {
    // Save scroll position before opening viewer
    savedScrollPosition.current = window.scrollY;
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewer = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
    // Restore scroll position after closing viewer
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollPosition.current, behavior: 'instant' });
    });
  };

  const brandLogo = brandLogos[brand];
  const seo = brandSEO[brand];

  // Breadcrumbs for structured navigation
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: getBrandDisplayName(brand), url: `/marca/${brandSlug?.toLowerCase()}` }
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
            alt={`Logo ${getBrandDisplayName(brand)} - Moda italiana mujer en La Loggia Alicante`} 
            className={`${brandLogo.height} w-auto object-contain grayscale opacity-80`}
          />
          
          {/* Brief hidden SEO content */}
          <p className="sr-only">{seo.style}</p>
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay prendas de esta marca</p>
        ) : (
          <EditableProductGrid products={products} onProductClick={handleProductClick} />
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

export default BrandPage;
