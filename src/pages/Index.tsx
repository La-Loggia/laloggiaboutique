import { useState } from 'react';
import Header from '@/components/Header';
import BrandMarquee from '@/components/BrandMarquee';
import HomeLatestPreview from '@/components/HomeLatestPreview';
import HomeBrandsBlock from '@/components/HomeBrandsBlock';
import VisitSection from '@/components/VisitSection';
import ImageViewer from '@/components/ImageViewer';
import SEOHead from '@/components/SEOHead';
import LocalSEOContent from '@/components/LocalSEOContent';
import { Product } from '@/hooks/useProducts';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

        <VisitSection />
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default Index;
