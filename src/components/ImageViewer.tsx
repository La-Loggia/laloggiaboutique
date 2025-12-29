import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { whatsappNumber, whatsappMessage } from '@/data/products';
import { Product, useProductImages, useProductsByBrand, useLatestProducts } from '@/hooks/useProducts';
import WhatsAppButton from './WhatsAppButton';

interface ImageViewerProps {
  product: Product;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

const ImageViewer = ({ product, onClose, onProductClick }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brandCanScrollLeft, setBrandCanScrollLeft] = useState(false);
  const [brandCanScrollRight, setBrandCanScrollRight] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  // Reset index when product changes
  useEffect(() => {
    setCurrentIndex(0);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const { data: additionalImages = [] } = useProductImages(product.id);
  const { data: brandProducts = [] } = useProductsByBrand(product.brand);
  const { data: latestProducts = [] } = useLatestProducts(6);
  
  const allImages = [
    product.imageUrl,
    ...additionalImages.map(img => img.imageUrl)
  ];

  // Filter out current product and get more from same brand
  const moreBrandProducts = brandProducts
    .filter(p => p.id !== product.id)
    .slice(0, 10);

  // Filter out current product from latest products
  const alsoLikeProducts = latestProducts
    .filter(p => p.id !== product.id)
    .slice(0, 6);

  // Check scroll availability for brand section
  const checkBrandScroll = useCallback(() => {
    if (brandScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = brandScrollRef.current;
      setBrandCanScrollLeft(scrollLeft > 0);
      setBrandCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkBrandScroll();
    
    const brandEl = brandScrollRef.current;
    
    if (brandEl) {
      brandEl.addEventListener('scroll', checkBrandScroll);
    }
    
    return () => {
      if (brandEl) {
        brandEl.removeEventListener('scroll', checkBrandScroll);
      }
    };
  }, [checkBrandScroll, moreBrandProducts.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < allImages.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    
    touchStartX.current = null;
  };

  const handleRelatedProductClick = (relatedProduct: Product) => {
    if (onProductClick) {
      onProductClick(relatedProduct);
    }
  };

  const scrollBrandLeft = () => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollBrandRight = () => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const currentImageUrl = allImages[currentIndex];
  const messageWithImage = `${whatsappMessage}\n\nPrenda: ${currentImageUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageWithImage)}`;

  return (
    <div ref={contentRef} className="fixed inset-0 z-[100] bg-neutral-100 overflow-y-auto">
      {/* Fixed header with logo */}
      <header className="fixed top-0 left-0 right-0 z-[105] bg-neutral-100/95 backdrop-blur-sm border-b border-neutral-200/50">
        <div className="px-4 py-3 text-center">
          <h1 className="font-serif text-xl tracking-[0.3em] font-medium text-foreground">
            LA LOGGIA
          </h1>
          <p className="font-sans text-[10px] tracking-[0.2em] text-muted-foreground mt-0.5 uppercase">
            Altea · San Juan · Campello
          </p>
        </div>
      </header>

      {/* Back button */}
      <button
        onClick={onClose}
        className="fixed top-3 left-3 z-[110] flex items-center justify-center w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full transition-colors hover:bg-white shadow-sm"
        aria-label="Volver"
      >
        <ArrowLeft className="w-4 h-4 text-black" />
      </button>

      {/* Main content */}
      <div className="pt-20 md:pt-20 pb-28 md:pb-24">
        {/* Product images section */}
        <div className="px-3 md:px-8 max-w-6xl mx-auto">
          {/* Thumbnails on left + Main image on right (both mobile and desktop) */}
          <div className="flex gap-2 md:gap-4">
            {/* Thumbnails column - left side on both mobile and desktop */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-1.5 md:gap-2 shrink-0">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-12 md:w-14 aspect-[9/16] overflow-hidden shrink-0 transition-opacity ${
                      index === currentIndex 
                        ? 'opacity-100' 
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div 
              className="flex-1 flex justify-center"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={allImages[currentIndex]}
                alt={`Prenda de ${product.brand}`}
                className="w-auto max-w-[65vw] md:max-w-lg max-h-[60vh] md:max-h-none object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-200 my-6 md:my-8" />

        {/* More from brand section */}
        {moreBrandProducts.length > 0 && (
          <div className="px-3 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
              Más de {product.brand}
            </p>
            <div className="relative flex items-center">
              {/* Left arrow - appears when can scroll left */}
              {brandCanScrollLeft && (
                <button
                  onClick={scrollBrandLeft}
                  className="absolute left-0 z-10 flex items-center justify-center w-6 h-12 bg-gradient-to-r from-neutral-100 via-neutral-100/90 to-transparent"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                </button>
              )}
              
              <div 
                ref={brandScrollRef}
                className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide w-full"
              >
                {moreBrandProducts.map((relatedProduct) => (
                  <button
                    key={relatedProduct.id}
                    onClick={() => handleRelatedProductClick(relatedProduct)}
                    className="w-24 md:w-32 shrink-0 aspect-[9/16] overflow-hidden rounded bg-secondary"
                  >
                    <img
                      src={relatedProduct.imageUrl}
                      alt={`Prenda de ${relatedProduct.brand}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Right arrow - appears when can scroll right */}
              {brandCanScrollRight && (
                <button
                  onClick={scrollBrandRight}
                  className="absolute right-0 z-10 flex items-center justify-center w-6 h-12 bg-gradient-to-l from-neutral-100 via-neutral-100/90 to-transparent"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-neutral-200 my-6 md:my-8" />

        {/* Also like section */}
        {alsoLikeProducts.length > 0 && (
          <div className="px-3 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3 md:mb-4">
              También te puede interesar
            </p>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {alsoLikeProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                  className="text-left"
                >
                  <div className="aspect-[9/16] overflow-hidden rounded bg-secondary">
                    <img
                      src={relatedProduct.imageUrl}
                      alt={`Prenda de ${relatedProduct.brand}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="brand-name text-center">
                    {relatedProduct.brand}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp button - fixed on both mobile and desktop */}
      <WhatsAppButton href={whatsappUrl} fixed label="Preguntar en La Loggia más información sobre esta prenda" />
    </div>
  );
};

export default ImageViewer;
