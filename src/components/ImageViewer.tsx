import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { whatsappNumber, whatsappMessage } from '@/data/products';
import { Product, useProductImages, useProductsByBrand, useLatestProducts } from '@/hooks/useProducts';
import { Brand, brands } from '@/data/products';
import WhatsAppButton from './WhatsAppButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import moorLogo from '@/assets/logo-moor.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';
import dixieLogo from '@/assets/logo-dixie.png';
import jottLogo from '@/assets/logo-jott.png';
import replayLogo from '@/assets/logo-replay.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import lolaCasademuntLogo from '@/assets/logo-lolacasademunt.png';

const brandLogos: Record<Brand, string> = {
  'MOOR': moorLogo,
  'SaintTropez': saintTropezLogo,
  'DiLei': dileiLogo,
  'Mela': melaLogo,
  'Pecatto': pecattoLogo,
  'Dixie': dixieLogo,
  'JOTT': jottLogo,
  'Replay': replayLogo,
  'RueMadam': rueMadamLogo,
  'LolaCasademunt': lolaCasademuntLogo,
};

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

interface ImageViewerProps {
  product: Product;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

const ImageViewer = ({ product, onClose, onProductClick }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brandCanScrollLeft, setBrandCanScrollLeft] = useState(false);
  const [brandCanScrollRight, setBrandCanScrollRight] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  // Reset index and zoom when product changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFullscreen(false);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  // Reset zoom when closing fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

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

  // Zoom handlers for fullscreen
  const handleImageWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomScale(prev => Math.min(Math.max(prev + delta, 1), 4));
    if (zoomScale + delta <= 1) {
      setZoomPosition({ x: 0, y: 0 });
    }
  };

  const handleImageTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - zoomPosition.x,
        y: e.touches[0].clientY - zoomPosition.y
      });
    }
  };

  const handleImageTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastTouchDistance.current) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      // Smoother zoom sensitivity
      const delta = (distance - lastTouchDistance.current) * 0.005;
      const newScale = Math.min(Math.max(zoomScale + delta, 1), 4);
      setZoomScale(newScale);
      lastTouchDistance.current = distance;
      if (newScale <= 1) {
        setZoomPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      setZoomPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleImageTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    lastTouchDistance.current = null;
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
    }
  };

  const currentImageUrl = allImages[currentIndex];
  const messageWithImage = `${whatsappMessage}\n\nPrenda: ${currentImageUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageWithImage)}`;


  return (
    <div ref={contentRef} className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      {/* Fixed header with banner + navigation */}
      <header className="fixed top-0 left-0 right-0 z-[105] bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Logo banner - FIRST */}
        <div className="px-4 py-3 text-center border-b border-border/30">
          <h1 className="font-serif text-xl tracking-[0.3em] font-medium text-foreground">
            LA LOGGIA
          </h1>
          <p className="font-sans text-[10px] tracking-[0.2em] text-muted-foreground mt-0.5 uppercase">
            Altea · San Juan · Campello
          </p>
        </div>

        {/* Navigation bar - BELOW BANNER */}
        <nav className="flex items-center justify-between px-4 py-2.5">
          {/* Back button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-[0.15em] uppercase">Volver</span>
          </button>

          {/* Brand dropdown - identical to BrandNav */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              Ver otras marcas
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border/50 min-w-[160px] z-[150]">
              {brands.map((brand) => (
                <DropdownMenuItem
                  key={brand}
                  asChild
                  className={product.brand === brand ? 'bg-muted' : ''}
                >
                  <Link
                    to={`/marca/${getBrandSlug(brand)}`}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  >
                    <img 
                      src={brandLogos[brand]} 
                      alt={brand} 
                      className="h-5 w-auto object-contain grayscale opacity-70"
                    />
                    <span className="text-xs tracking-[0.1em] uppercase">{brand}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      {/* Main content */}
      <div className="pt-28 md:pt-28 pb-28 md:pb-24">
        {/* Product images section */}
        <div className="px-3 md:px-8 max-w-6xl mx-auto">
          {/* Thumbnails on left + Main image on right (both mobile and desktop) */}
          <div className="flex gap-1 md:gap-2">
            {/* Thumbnails column - left side on both mobile and desktop */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-1 md:gap-1.5 shrink-0 mt-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-14 md:w-16 aspect-[9/16] overflow-hidden shrink-0 transition-all ${
                      index === currentIndex 
                        ? 'opacity-100 ring-2 ring-foreground ring-offset-1' 
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

            {/* Main image - fixed height container to prevent layout shift */}
            <div 
              className="flex-1 flex justify-center items-start h-[60vh] md:h-[70vh]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={allImages[currentIndex]}
                alt={`Prenda de ${product.brand}`}
                className="w-auto max-w-[65vw] md:max-w-lg h-full object-contain rounded cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border my-3 md:my-4" />

        {/* More from brand section */}
        {moreBrandProducts.length > 0 && (
          <div className="px-3 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Más de {product.brand}
            </p>
            <div className="relative flex items-center">
              {/* Left arrow - appears when can scroll left */}
              {brandCanScrollLeft && (
                <button
                  onClick={scrollBrandLeft}
                  className="absolute left-0 z-10 flex items-center justify-center w-6 h-12 bg-gradient-to-r from-background via-background/90 to-transparent"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
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
                  className="absolute right-0 z-10 flex items-center justify-center w-6 h-12 bg-gradient-to-l from-background via-background/90 to-transparent"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-border my-3 md:my-4" />

        {/* Also like section */}
        {alsoLikeProducts.length > 0 && (
          <div className="px-3 md:px-8 max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 md:mb-4">
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

      {/* Fullscreen image modal - true fullscreen like COS */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[200] bg-white animate-fade-in"
          onClick={() => zoomScale === 1 && setIsFullscreen(false)}
        >
          {/* Close button - minimal X */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-[210] flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-70"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-black" strokeWidth={1.5} />
          </button>

          {/* Zoomable fullscreen image - fills entire screen */}
          <div 
            className="w-full h-full"
            style={{ touchAction: 'none' }}
            onWheel={handleImageWheel}
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={allImages[currentIndex]}
              alt={`Prenda de ${product.brand}`}
              className="w-full h-full object-contain select-none"
              style={{
                transform: `scale(${zoomScale}) translate(${zoomPosition.x / zoomScale}px, ${zoomPosition.y / zoomScale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                touchAction: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>

          {/* Zoom indicator - only when zoomed */}
          {zoomScale > 1 && (
            <div className="absolute top-4 left-4 z-[210] bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              {Math.round(zoomScale * 100)}%
            </div>
          )}

          {/* WhatsApp button - fixed at bottom, always visible */}
          <div className="absolute bottom-0 left-0 right-0 z-[210] p-4 bg-gradient-to-t from-white via-white/80 to-transparent pt-8">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full max-w-lg mx-auto bg-foreground text-background font-sans text-sm tracking-wide px-5 py-3.5 rounded-lg transition-all duration-300 hover:bg-foreground/90 active:scale-[0.98]"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Preguntar sobre esta prenda</span>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
