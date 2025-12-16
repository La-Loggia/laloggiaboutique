import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { whatsappNumber, whatsappMessage } from '@/data/products';
import { Product, useProductImages } from '@/hooks/useProducts';
import WhatsAppButton from './WhatsAppButton';

interface ImageViewerProps {
  product: Product;
  onClose: () => void;
}

const ImageViewer = ({ product, onClose }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDistance = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const { data: additionalImages = [] } = useProductImages(product.id);
  
  // All images: main image + additional images
  const allImages = [
    product.imageUrl,
    ...additionalImages.map(img => img.imageUrl)
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistance.current = distance;
    } else if (e.touches.length === 1 && scale === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = distance / lastDistance.current;
      setScale((prev) => Math.min(Math.max(prev * delta, 1), 3));
      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Handle swipe for navigation (only when not zoomed)
    if (touchStartX.current !== null && scale === 1 && e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && currentIndex < allImages.length - 1) {
          // Swipe left - next image
          setCurrentIndex(prev => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe right - previous image
          setCurrentIndex(prev => prev - 1);
        }
      }
    }
    
    touchStartX.current = null;
    lastDistance.current = null;
    
    if (scale <= 1.1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const goToNext = () => {
    if (currentIndex < allImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] p-2 bg-white/10 backdrop-blur-sm rounded-full transition-colors hover:bg-white/20"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden zoom-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={allImages[currentIndex]}
          alt={`Prenda de ${product.brand}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Navigation arrows (only show if multiple images) */}
      {allImages.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-2 bg-white/10 backdrop-blur-sm rounded-full transition-colors hover:bg-white/20"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < allImages.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-2 bg-white/10 backdrop-blur-sm rounded-full transition-colors hover:bg-white/20"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </>
      )}

      {/* Dots indicator (only show if multiple images) */}
      {allImages.length > 1 && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Brand name */}
      <div className="absolute bottom-24 left-0 right-0 text-center">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-white/70">
          {product.brand}
        </p>
      </div>

      {/* WhatsApp button */}
      <WhatsAppButton href={whatsappUrl} fixed />
    </div>
  );
};

export default ImageViewer;
