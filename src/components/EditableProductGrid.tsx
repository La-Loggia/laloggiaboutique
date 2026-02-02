import { useCallback, useState } from 'react';
import { Product, useUpdateProductOrder } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { useAuth } from '@/hooks/useAuth';
import EditableProductCard from './EditableProductCard';
import ProductCard from './ProductCard';
import { toast } from 'sonner';

interface EditableProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const EditableProductGrid = ({ products, onProductClick }: EditableProductGridProps) => {
  const { isAdmin } = useAuth();
  const { isEditMode } = useAdminContext();
  const updateProductOrder = useUpdateProductOrder();
  
  // Pick & place state
  const [movingProductId, setMovingProductId] = useState<string | null>(null);
  const [insertBeforeId, setInsertBeforeId] = useState<string | null>(null);

  const getProductLayout = useCallback((index: number) => {
    const mobilePositionInPattern = index % 5;
    const isMobileFeatured = mobilePositionInPattern === 4;
    
    let isDesktopFeatured = false;
    if (index < 6) {
      isDesktopFeatured = index >= 4;
    } else {
      const adjustedIndex = index - 6;
      const positionInCycle = adjustedIndex % 10;
      isDesktopFeatured = positionInCycle >= 8;
    }
    
    return { isMobileFeatured, isDesktopFeatured };
  }, []);

  const handleStartMove = (productId: string) => {
    setMovingProductId(productId);
    setInsertBeforeId(null);
  };

  const handleCancelMove = () => {
    setMovingProductId(null);
    setInsertBeforeId(null);
  };

  const handleHoverProduct = (productId: string) => {
    if (movingProductId && productId !== movingProductId) {
      setInsertBeforeId(productId);
    }
  };

  const handleConfirmMove = async () => {
    if (!movingProductId || !insertBeforeId) {
      handleCancelMove();
      return;
    }

    const movingIndex = products.findIndex(p => p.id === movingProductId);
    const targetIndex = products.findIndex(p => p.id === insertBeforeId);
    
    if (movingIndex === -1 || targetIndex === -1 || movingIndex === targetIndex) {
      handleCancelMove();
      return;
    }

    // Create new order: remove moving product, insert at target position
    const newOrder = [...products];
    const [movedProduct] = newOrder.splice(movingIndex, 1);
    
    // If moving forward, target index shifts back by 1 after removal
    const adjustedTargetIndex = movingIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newOrder.splice(adjustedTargetIndex, 0, movedProduct);

    const updates = newOrder.map((p, index) => ({
      id: p.id,
      displayOrder: index + 1,
    }));

    try {
      await updateProductOrder.mutateAsync(updates);
      toast.success('Posición actualizada');
    } catch {
      toast.error('Error al mover producto');
    }

    handleCancelMove();
  };

  // Handle ESC key to cancel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && movingProductId) {
      handleCancelMove();
    }
  }, [movingProductId]);

  // Add/remove event listener
  useState(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  });

  // Standard grid for non-admin or non-edit mode
  if (!isAdmin || !isEditMode) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3">
        {products.map((product, index) => {
          const { isMobileFeatured, isDesktopFeatured } = getProductLayout(index);
          const colSpanClass = `${isMobileFeatured ? 'col-span-2' : 'col-span-1'} ${isDesktopFeatured ? 'md:col-span-2' : 'md:col-span-1'}`;
          
          if (isAdmin) {
            return (
              <div key={product.id} className={colSpanClass}>
                <EditableProductCard
                  product={product}
                  onClick={() => onProductClick(product)}
                  index={index}
                  featured={isMobileFeatured || isDesktopFeatured}
                />
              </div>
            );
          }
          
          return (
            <div key={product.id} className={colSpanClass}>
              <ProductCard
                product={product}
                onClick={() => onProductClick(product)}
                index={index}
                featured={isMobileFeatured || isDesktopFeatured}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Edit mode with pick & place
  const movingProduct = products.find(p => p.id === movingProductId);

  return (
    <>
      {/* Moving mode overlay with instructions */}
      {movingProductId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          Mueve el ratón sobre otra prenda y haz clic para colocar • ESC para cancelar
        </div>
      )}

      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3"
        onClick={(e) => {
          // Click on grid background cancels move
          if (movingProductId && e.target === e.currentTarget) {
            handleCancelMove();
          }
        }}
      >
        {products.map((product, index) => {
          const { isMobileFeatured, isDesktopFeatured } = getProductLayout(index);
          const colSpanClass = `${isMobileFeatured ? 'col-span-2' : 'col-span-1'} ${isDesktopFeatured ? 'md:col-span-2' : 'md:col-span-1'}`;
          
          const isMoving = product.id === movingProductId;
          const isInsertTarget = product.id === insertBeforeId;

          return (
            <div 
              key={product.id} 
              className={`relative ${colSpanClass} ${isMoving ? 'opacity-40 scale-95' : ''} transition-all duration-200`}
              onMouseEnter={() => handleHoverProduct(product.id)}
              onClick={() => {
                if (movingProductId && !isMoving) {
                  handleConfirmMove();
                }
              }}
            >
              {/* Insertion indicator - shows gap before this product */}
              {isInsertTarget && movingProduct && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-primary rounded-full z-10 animate-pulse" />
              )}
              
              {/* Highlight ring when this is the drop target */}
              {isInsertTarget && (
                <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 rounded-lg z-10 pointer-events-none" />
              )}

              <EditableProductCard
                product={product}
                onClick={() => {
                  if (!movingProductId) {
                    onProductClick(product);
                  }
                }}
                index={index}
                featured={isMobileFeatured || isDesktopFeatured}
                onStartMove={handleStartMove}
                isInMoveMode={!!movingProductId}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default EditableProductGrid;
