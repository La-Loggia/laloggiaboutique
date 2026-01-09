/**
 * Image optimization utilities using Supabase Storage transformations
 * Converts heavy PNGs to optimized WebP with responsive sizing
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

// Breakpoints for responsive images
export const IMAGE_SIZES = {
  thumbnail: 200,
  small: 400,
  medium: 600,
  large: 800,
  xlarge: 1200,
} as const;

// Quality settings (lower = smaller file, 60-80 is good for web)
const DEFAULT_QUALITY = 75;
const HIGH_QUALITY = 85;

interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

/**
 * Check if URL is from Supabase Storage
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('supabase.co/storage') || 
         url.includes(`${SUPABASE_PROJECT_ID}.supabase`);
};

/**
 * Extract bucket and path from Supabase Storage URL
 */
const parseSupabaseUrl = (url: string): { bucket: string; path: string } | null => {
  try {
    // Pattern: .../storage/v1/object/public/bucket-name/path
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      return { bucket: match[1], path: match[2] };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Generate optimized image URL using Supabase Image Transformation
 * Uses the render endpoint for on-the-fly optimization
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: OptimizedImageOptions = {}
): string => {
  if (!originalUrl || !isSupabaseStorageUrl(originalUrl)) {
    return originalUrl;
  }

  const parsed = parseSupabaseUrl(originalUrl);
  if (!parsed) return originalUrl;

  const { bucket, path } = parsed;
  const { width, height, quality = DEFAULT_QUALITY, format = 'webp' } = options;

  // Build transformation parameters
  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  if (format !== 'origin') params.set('format', format);
  
  // Use resize mode to maintain aspect ratio
  params.set('resize', 'contain');

  // Construct render URL
  return `${SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${path}?${params.toString()}`;
};

/**
 * Generate srcset for responsive images
 */
export const getResponsiveSrcSet = (
  originalUrl: string,
  sizes: number[] = [400, 600, 800, 1200],
  quality: number = DEFAULT_QUALITY
): string => {
  if (!isSupabaseStorageUrl(originalUrl)) {
    return '';
  }

  return sizes
    .map(width => {
      const url = getOptimizedImageUrl(originalUrl, { width, quality });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Get optimized URLs for different device sizes
 */
export const getResponsiveImageUrls = (originalUrl: string) => {
  if (!isSupabaseStorageUrl(originalUrl)) {
    return {
      mobile: originalUrl,
      tablet: originalUrl,
      desktop: originalUrl,
      srcSet: '',
    };
  }

  return {
    mobile: getOptimizedImageUrl(originalUrl, { width: 400, quality: 70 }),
    tablet: getOptimizedImageUrl(originalUrl, { width: 600, quality: 75 }),
    desktop: getOptimizedImageUrl(originalUrl, { width: 800, quality: 80 }),
    srcSet: getResponsiveSrcSet(originalUrl, [400, 600, 800, 1200]),
  };
};

/**
 * Get thumbnail URL for quick loading
 */
export const getThumbnailUrl = (originalUrl: string, size: number = 200): string => {
  return getOptimizedImageUrl(originalUrl, { 
    width: size, 
    quality: 60,
    format: 'webp' 
  });
};

/**
 * Preload critical images (above the fold)
 */
export const preloadCriticalImages = (urls: string[], maxCount: number = 4): void => {
  urls.slice(0, maxCount).forEach((url) => {
    const optimizedUrl = getOptimizedImageUrl(url, { width: 600, quality: 75 });
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
};
