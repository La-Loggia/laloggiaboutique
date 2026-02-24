import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BrandMarquee from '@/components/BrandMarquee';
import HomeLatestPreview from '@/components/HomeLatestPreview';
import HomeBrandsBlock from '@/components/HomeBrandsBlock';
import HomeBolsosBlock from '@/components/HomeBolsosBlock';
import VisitSection from '@/components/VisitSection';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import LocalSEOContent from '@/components/LocalSEOContent';
import { Product } from '@/hooks/useProducts';
import { useRestoreScroll } from '@/hooks/useScrollPosition';

const Index = () => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const savedScrollPosition = useRef<number>(0);

  // Restore scroll position when returning to this page
  useRestoreScroll();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="La Loggia · Boutique de moda mujer en Altea, San Juan y Campello"
        description="La Loggia es una boutique de moda femenina con tiendas en Altea, San Juan y Campello. Marcas italianas exclusivas como MOOR, Saint Tropez y DiLei."
        canonicalPath="/"
      />
      
      <Header />
      <BrandMarquee />

      <main>
        {/* H1 único para SEO - visualmente integrado */}
        <header className="text-center py-8 px-4">
          <h1 className="font-serif text-xl md:text-2xl font-light text-foreground tracking-wide">
            Boutique de moda femenina en Alicante
          </h1>
          <p className="font-sans text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Moda italiana exclusiva en Altea, San Juan y Campello
          </p>
        </header>

        <LocalSEOContent />

        {/* Espacio Jeans Banner */}
        <Link 
          to="/espacio-jeans" 
          className="block mx-3 mb-6 relative overflow-hidden rounded-sm bg-foreground group"
        >
          <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-7">
            <div className="flex-1">
              <span className="inline-block text-[9px] tracking-[0.15em] uppercase bg-background text-foreground px-2.5 py-1 rounded-full font-semibold mb-3">
                Nuevo
              </span>
              <h2 className="font-serif text-lg md:text-2xl text-background tracking-wide">
                Espacio Jeans
              </h2>
              <p className="font-sans text-[11px] md:text-xs text-background/60 mt-1.5 tracking-wide">
                Descubre nuestra nueva sección denim
              </p>
            </div>
            <div className="text-background/80 group-hover:translate-x-1 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </Link>

        <HomeLatestPreview onProductClick={handleProductClick} />
        
        <div className="border-t border-border/30" />

        <HomeBrandsBlock />

        <div className="border-t border-border/30" />

        <HomeBolsosBlock />

        <div className="border-t border-border/30" />

        <VisitSection />
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

export default Index;
