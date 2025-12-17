import { useState } from 'react';
import { X } from 'lucide-react';
import { whatsappNumber, whatsappMessage } from '@/data/products';
import { Product, useProductImages } from '@/hooks/useProducts';
import WhatsAppButton from './WhatsAppButton';

interface ImageViewerProps {
  product: Product;
  onClose: () => void;
}

const ImageViewer = ({ product, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: additionalImages = [] } = useProductImages(product.id);
  
  // All images: main image + additional images
  const allImages = [
    product.imageUrl,
    ...additionalImages.map(img => img.imageUrl)
  ];

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100 animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] p-2 bg-black/10 backdrop-blur-sm rounded-full transition-colors hover:bg-black/20"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 text-black" />
      </button>

      {/* Main content container */}
      <div className="h-full flex items-center justify-center p-4 md:p-8">
        {/* Mobile: vertical layout, Desktop: horizontal layout */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full max-h-[90vh] w-full max-w-5xl">
          
          {/* Thumbnails column (left on desktop, hidden on mobile - shown below) */}
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

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center min-w-0 min-h-0">
            <img
              src={allImages[currentIndex]}
              alt={`Prenda de ${product.brand}`}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>

          {/* Thumbnails row (bottom on mobile only) */}
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
