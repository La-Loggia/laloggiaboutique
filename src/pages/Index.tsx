import { useState, useRef } from 'react';
import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import LatestSection from '@/components/LatestSection';
import BrandSection from '@/components/BrandSection';
import VisitSection from '@/components/VisitSection';
import ImageViewer from '@/components/ImageViewer';
import { Brand, brands, Product } from '@/data/products';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<Brand | null>(null);
  const sectionRefs = useRef<Record<Brand, HTMLElement | null>>({} as Record<Brand, HTMLElement | null>);

  const handleBrandClick = (brand: Brand) => {
    setActiveSection(brand);
    const element = sectionRefs.current[brand];
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
      <BrandNav activeSection={activeSection} onBrandClick={handleBrandClick} />

      <main>
        <LatestSection onProductClick={handleProductClick} />
        
        <div className="border-t border-border/30" />

        {brands.map((brand) => (
          <BrandSection
            key={brand}
            ref={(el) => (sectionRefs.current[brand] = el)}
            brand={brand}
            onProductClick={handleProductClick}
          />
        ))}

        <VisitSection />
      </main>

      {selectedProduct && (
        <ImageViewer product={selectedProduct} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default Index;
