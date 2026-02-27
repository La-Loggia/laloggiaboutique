import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface ViewedProductsContextType {
  markAsViewed: (productId: string) => void;
  getViewedIds: () => Set<string>;
  sessionSeed: number;
}

const ViewedProductsContext = createContext<ViewedProductsContextType | null>(null);

export const ViewedProductsProvider = ({ children }: { children: ReactNode }) => {
  const [viewedIds] = useState(() => new Set<string>());
  const sessionSeed = useRef(Math.floor(Math.random() * 2147483646) + 1).current;

  const markAsViewed = useCallback((productId: string) => {
    viewedIds.add(productId);
  }, [viewedIds]);

  const getViewedIds = useCallback(() => viewedIds, [viewedIds]);

  return (
    <ViewedProductsContext.Provider value={{ markAsViewed, getViewedIds, sessionSeed }}>
      {children}
    </ViewedProductsContext.Provider>
  );
};

export const useViewedProducts = () => {
  const ctx = useContext(ViewedProductsContext);
  if (!ctx) throw new Error('useViewedProducts must be used within ViewedProductsProvider');
  return ctx;
};

/**
 * Seeded shuffle — deterministic within a session but different across sessions.
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
