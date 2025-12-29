import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset index and trigger transition when product changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(true);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [product.id]);

  const { data: additionalImages = [] } = useProductImages(product.id);
  const { data: brandProducts = [] } = useProductsByBrand(product.brand);
  const { data: latestProducts = [] } = useLatestProducts(6);
  
  const allImages = [
    product.imageUrl,
    ...additionalImages.map(img => img.imageUrl)
  ];

  // Filter out current product and get 3 most recent from same brand
  const moreBrandProducts = brandProducts
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  // Filter out current product from latest products
  const alsoLikeProducts = latestProducts
    .filter(p => p.id !== product.id)
    .slice(0, 6);

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
      setIsTransitioning(true);
      setTimeout(() => {
        onProductClick(relatedProduct);
      }, 150);
    }
  };

  const currentImageUrl = allImages[currentIndex];
  const messageWithImage = `${whatsappMessage}\n\nPrenda: ${currentImageUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageWithImage)}`;

  return (
    <div ref={contentRef} className="fixed inset-0 z-[100] bg-neutral-100 overflow-y-auto">
      {/* Back button */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[110] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full transition-colors hover:bg-white shadow-sm"
        aria-label="Volver"
      >
        <ArrowLeft className="w-4 h-4 text-black" />
        <span className="text-sm font-medium text-black">Volver</span>
      </button>

      {/* Main content */}
      <div className={`pt-16 pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Product images section */}
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            
            {/* Thumbnails - left on desktop, horizontal scroll on mobile */}
            {allImages.length > 1 && (
              <>
                {/* Desktop: vertical column on left */}
                <div className="hidden md:flex flex-col gap-2 w-20 shrink-0">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative aspect-[3/4] overflow-hidden rounded transition-all ${
                        index === currentIndex 
                          ? 'ring-2 ring-black ring-offset-1' 
                          : 'opacity-60 hover:opacity-100'
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

                {/* Mobile: horizontal scroll */}
                <div 
                  className="flex md:hidden gap-2 overflow-x-auto shrink-0 pb-2 scrollbar-hide"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative w-16 aspect-[3/4] overflow-hidden rounded transition-all shrink-0 ${
                        index === currentIndex 
                          ? 'ring-2 ring-black ring-offset-1' 
                          : 'opacity-60 hover:opacity-100'
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
              </>
            )}

            {/* Main image */}
            <div className="flex-1 flex items-start justify-center">
              <img
                src={allImages[currentIndex]}
                alt={`Prenda de ${product.brand}`}
                className="w-full max-w-lg object-contain rounded"
              />
            </div>
          </div>
        </div>

        {/* More from brand section */}
        {moreBrandProducts.length > 0 && (
          <div className="mt-12 px-4 md:px-8 max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Más de {product.brand}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {moreBrandProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                  className="aspect-[3/4] overflow-hidden rounded bg-secondary transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={relatedProduct.imageUrl}
                    alt={`Prenda de ${relatedProduct.brand}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Also like section */}
        {alsoLikeProducts.length > 0 && (
          <div className="mt-12 px-4 md:px-8 max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-black">
              También te puede interesar
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {alsoLikeProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                  className="aspect-[3/4] overflow-hidden rounded bg-secondary transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={relatedProduct.imageUrl}
                    alt={`Prenda de ${relatedProduct.brand}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp button */}
      <WhatsAppButton href={whatsappUrl} fixed label="Preguntar en La Loggia más información sobre esta prenda" />
    </div>
  );
};

export default ImageViewer;
