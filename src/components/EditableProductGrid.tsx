import { useCallback, useState, useEffect } from 'react';
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
  const [insertAfterLast, setInsertAfterLast] = useState(false);

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
    setInsertAfterLast(false);
  };

  const handleCancelMove = useCallback(() => {
    setMovingProductId(null);
    setInsertBeforeId(null);
    setInsertAfterLast(false);
  }, []);

  const handleHoverProduct = (productId: string) => {
    if (movingProductId && productId !== movingProductId) {
      setInsertBeforeId(productId);
      setInsertAfterLast(false);
    }
  };

  const handleConfirmMove = async () => {
    if (!movingProductId) {
      handleCancelMove();
      return;
    }

    const movingIndex = products.findIndex(p => p.id === movingProductId);
    
    if (movingIndex === -1) {
      handleCancelMove();
      return;
    }

    let newOrder = [...products];
    const [movedProduct] = newOrder.splice(movingIndex, 1);

    if (insertAfterLast) {
      newOrder.push(movedProduct);
    } else if (insertBeforeId) {
      const targetIndex = newOrder.findIndex(p => p.id === insertBeforeId);
      if (targetIndex === -1) {
        handleCancelMove();
        return;
      }
      newOrder.splice(targetIndex, 0, movedProduct);
    } else {
      handleCancelMove();
      return;
    }

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && movingProductId) {
        handleCancelMove();
      }
    };
    
    if (movingProductId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [movingProductId, handleCancelMove]);

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
      {movingProductId && movingProduct && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
          <img 
            src={movingProduct.imageUrl} 
            alt="" 
            className="w-8 h-10 object-cover rounded"
          />
          <span>Pasa el ratón por donde quieras colocarla y haz clic • ESC para cancelar</span>
        </div>
      )}

      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3"
        onClick={(e) => {
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
          const isLastProduct = index === products.length - 1;

          return (
            <div 
              key={product.id} 
              className={`relative ${colSpanClass} ${isMoving ? 'opacity-30 scale-90 grayscale' : ''} transition-all duration-200`}
              onMouseEnter={() => handleHoverProduct(product.id)}
              onClick={() => {
                if (movingProductId && !isMoving) {
                  handleConfirmMove();
                }
              }}
            >
              {/* Blue insertion indicator - LEFT side */}
              {isInsertTarget && !isMoving && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-1.5 bg-blue-500 rounded-full z-30 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
              )}
              
              {/* Highlight box when this is the drop target */}
              {isInsertTarget && !isMoving && (
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg z-20 pointer-events-none bg-blue-500/10" />
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

              {/* Insert AFTER last product indicator */}
              {isLastProduct && movingProductId && !isMoving && insertAfterLast && (
                <div className="absolute -right-1.5 top-0 bottom-0 w-1.5 bg-blue-500 rounded-full z-30 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
              )}
            </div>
          );
        })}

        {/* Invisible drop zone after last product */}
        {movingProductId && (
          <div 
            className="col-span-1 h-20 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-100/50"
            onMouseEnter={() => {
              setInsertBeforeId(null);
              setInsertAfterLast(true);
            }}
            onClick={handleConfirmMove}
          >
            <span className="text-xs text-blue-500 font-medium">Al final</span>
          </div>
        )}
      </div>
    </>
  );
};

export default EditableProductGrid;
