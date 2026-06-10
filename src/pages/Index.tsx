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
        title="Moda italiana de mujer en Alicante · La Loggia | Altea, San Juan, Campello"
        description="La Loggia, boutique de moda italiana de mujer en Alicante. Firmas exclusivas como MOOR, Saint Tropez y DiLei en nuestras tiendas de Altea, San Juan y Campello."
        canonicalPath="/"
      />
      
      <Header />
      <BrandMarquee />

      <main>
        {/* H1 único para SEO - visualmente integrado */}
        <header className="text-center py-8 px-4">
          <h1 className="font-serif text-xl md:text-2xl font-light text-foreground tracking-wide">
            Moda italiana de mujer en Alicante
          </h1>
          <p className="font-sans text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Boutique La Loggia · Altea, San Juan y El Campello
          </p>
          <Link
            to="/moda-italiana-mujer-alicante"
            className="inline-block mt-4 text-[11px] tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground transition-colors pb-0.5"
          >
            Descubrir la moda italiana
          </Link>
        </header>

        <LocalSEOContent />


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
