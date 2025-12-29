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
  const touchStartX = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      onProductClick(relatedProduct);
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
      <div className="pt-16 pb-24">
        {/* Product images section */}
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          {/* Main image */}
          <div 
            className="w-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={allImages[currentIndex]}
              alt={`Prenda de ${product.brand}`}
              className="w-full max-w-lg mx-auto object-contain rounded"
            />
          </div>

          {/* Thumbnails below main image */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-16 aspect-[3/4] overflow-hidden rounded shrink-0 ${
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
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-200 my-8" />

        {/* More from brand section */}
        {moreBrandProducts.length > 0 && (
          <div className="px-4 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
              Más de {product.brand}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {moreBrandProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                  className="aspect-[9/16] overflow-hidden rounded bg-secondary"
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

        {/* Divider */}
        <div className="w-full h-px bg-neutral-200 my-8" />

        {/* Also like section */}
        {alsoLikeProducts.length > 0 && (
          <div className="px-4 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
              También te puede interesar
            </p>
            <div className="grid grid-cols-2 gap-3">
              {alsoLikeProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                  className="aspect-[9/16] overflow-hidden rounded bg-secondary"
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
