import { useState } from 'react';
import Header from '@/components/Header';
import BrandMarquee from '@/components/BrandMarquee';
import HomeLatestPreview from '@/components/HomeLatestPreview';
import HomeBrandsBlock from '@/components/HomeBrandsBlock';
import VisitSection from '@/components/VisitSection';
import ImageViewer from '@/components/ImageViewer';
import { Product } from '@/data/products';

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
      <Header />
      <BrandMarquee />

      <main>
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
