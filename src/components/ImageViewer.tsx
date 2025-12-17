import { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { whatsappNumber, whatsappMessage } from '@/data/products';
import { Product, useProductImages } from '@/hooks/useProducts';
import WhatsAppButton from './WhatsAppButton';

interface ImageViewerProps {
  product: Product;
  onClose: () => void;
}

const ImageViewer = ({ product, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const { data: additionalImages = [] } = useProductImages(product.id);
  
  const allImages = [
    product.imageUrl,
    ...additionalImages.map(img => img.imageUrl)
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < allImages.length - 1) {
        // Swipe up - next image
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous image
        setCurrentIndex(prev => prev - 1);
      }
    }
    
    touchStartY.current = null;
  };

  const currentImageUrl = allImages[currentIndex];
  const messageWithImage = `${whatsappMessage}\n\nPrenda: ${currentImageUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageWithImage)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-[110] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full transition-colors hover:bg-white shadow-sm"
        aria-label="Volver"
      >
        <ArrowLeft className="w-4 h-4 text-black" />
        <span className="text-sm font-medium text-black">Volver a novedades</span>
      </button>

      {/* Main content container */}
      <div className="h-full flex items-center justify-center p-4 pt-16 md:p-8 md:pt-20">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full max-h-[85vh] w-full max-w-5xl">
          
          {/* Thumbnails column (left on desktop) */}
          {allImages.length > 1 && (
            <div className="hidden md:flex flex-col gap-2 overflow-y-auto w-24 shrink-0">
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
          )}

          {/* Main image with swipe support on mobile */}
          <div 
            className="flex-1 flex items-center justify-center min-w-0 min-h-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={allImages[currentIndex]}
              alt={`Prenda de ${product.brand}`}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>

          {/* Thumbnails row (bottom on mobile) */}
          {allImages.length > 1 && (
            <div className="flex md:hidden gap-2 overflow-x-auto justify-center shrink-0 pb-16">
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
          )}
        </div>
      </div>

      {/* WhatsApp button */}
      <WhatsAppButton href={whatsappUrl} fixed />
    </div>
  );
};

export default ImageViewer;
