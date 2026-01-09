import { useState, useEffect, useRef, memo } from 'react';
import { 
  getOptimizedImageUrl, 
  getResponsiveSrcSet, 
  getThumbnailUrl,
  isSupabaseStorageUrl 
} from '@/lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Priority loading for above-the-fold images */
  priority?: boolean;
  /** Image sizes for srcset (default: responsive) */
  sizes?: string;
  /** Max width to request from server */
  maxWidth?: number;
  /** Quality 1-100 (default: 75) */
  quality?: number;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Object fit mode */
  objectFit?: 'cover' | 'contain' | 'fill';
}

/**
 * Optimized image component with:
 * - WebP format conversion
 * - Responsive srcset
 * - Lazy loading (with priority option)
 * - Blur-up placeholder
 * - Intersection Observer for true lazy loading
 */
const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  maxWidth = 800,
  quality = 75,
  onLoad,
  objectFit = 'cover',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs
  const isOptimizable = isSupabaseStorageUrl(src);
  const optimizedSrc = isOptimizable 
    ? getOptimizedImageUrl(src, { width: maxWidth, quality }) 
    : src;
  const srcSet = isOptimizable 
    ? getResponsiveSrcSet(src, [400, 600, 800, 1200], quality) 
    : undefined;
  const placeholderSrc = isOptimizable 
    ? getThumbnailUrl(src, 20) 
    : undefined;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    // Fallback to original on error
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  }[objectFit];

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {placeholderSrc && !isLoaded && isInView && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full ${objectFitClass} blur-lg scale-110 opacity-50`}
        />
      )}
      
      {/* Main image */}
      {(isInView || priority) && (
        <picture>
          {/* WebP source */}
          {srcSet && !hasError && (
            <source
              type="image/webp"
              srcSet={srcSet}
              sizes={sizes}
            />
          )}
          
          <img
            src={hasError ? src : optimizedSrc}
            srcSet={!hasError && srcSet ? srcSet : undefined}
            sizes={!hasError && srcSet ? sizes : undefined}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full ${objectFitClass}
              transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </picture>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !isInView && (
        <div className="absolute inset-0 bg-secondary animate-pulse" />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
