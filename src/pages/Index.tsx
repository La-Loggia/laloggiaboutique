import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BrandMarquee from '@/components/BrandMarquee';
import HomeLatestPreview from '@/components/HomeLatestPreview';
import HomeBrandsBlock from '@/components/HomeBrandsBlock';
import HomeBolsosBlock from '@/components/HomeBolsosBlock';
import VisitSection from '@/components/VisitSection';
import SEOHead from '@/components/SEOHead';
import LocalSEOContent from '@/components/LocalSEOContent';
import { Product } from '@/hooks/useProducts';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasScrolledToTop = useRef(false);

  // Scroll to top on mount (only once per page load), unless there's a hash
  useEffect(() => {
    if (!hasScrolledToTop.current && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      hasScrolledToTop.current = true;
    }
  }, [location.hash]);

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
    // Navigate to the brand page
    const brandSlug = product.brand.toLowerCase();
    navigate(`/marca/${brandSlug}`);
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

        <HomeLatestPreview onProductClick={handleProductClick} />
        
        <div className="border-t border-border/30" />

        <HomeBrandsBlock />

        <div className="border-t border-border/30" />

        <HomeBolsosBlock />

        <div className="border-t border-border/30" />

        <VisitSection />
      </main>
    </div>
  );
};

export default Index;
