import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Global storage for scroll positions by route
const scrollPositions: Record<string, number> = {};

/**
 * Hook to save and restore scroll positions when navigating between pages.
 * - Saves the current scroll position before leaving a page
 * - Restores the scroll position when returning to a page
 * - Ensures new page visits start at the top
 */
export const useScrollPosition = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isRestoring = useRef(false);
  const hasRestoredForPath = useRef<string | null>(null);

  // Save current scroll position for the current route
  const saveScrollPosition = useCallback(() => {
    scrollPositions[currentPath] = window.scrollY;
  }, [currentPath]);

  // Restore scroll position for the current route (if exists)
  const restoreScrollPosition = useCallback(() => {
    if (hasRestoredForPath.current === currentPath) {
      return; // Already restored for this path
    }
    
    const savedPosition = scrollPositions[currentPath];
    if (savedPosition !== undefined && savedPosition > 0) {
      isRestoring.current = true;
      hasRestoredForPath.current = currentPath;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedPosition, behavior: 'instant' });
        isRestoring.current = false;
      });
    } else {
      // No saved position - scroll to top for new visits
      hasRestoredForPath.current = currentPath;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPath]);

  // Clear scroll position for a route (for fresh starts)
  const clearScrollPosition = useCallback((path?: string) => {
    const targetPath = path || currentPath;
    delete scrollPositions[targetPath];
  }, [currentPath]);

  // Save position before user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    // Save on scroll (debounced via the component lifecycle)
    const handleScroll = () => {
      if (!isRestoring.current) {
        scrollPositions[currentPath] = window.scrollY;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      // Save position when unmounting (navigating away)
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPath, saveScrollPosition]);

  // Reset the hasRestored ref when path changes
  useEffect(() => {
    if (hasRestoredForPath.current !== currentPath) {
      hasRestoredForPath.current = null;
    }
  }, [currentPath]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
};

/**
 * Hook specifically for pages that need to restore scroll on mount
 */
export const useRestoreScroll = () => {
  const { restoreScrollPosition } = useScrollPosition();

  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 50);

    return () => clearTimeout(timer);
  }, [restoreScrollPosition]);
};

/**
 * Hook to ensure page starts at top (for fresh page loads)
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
};
