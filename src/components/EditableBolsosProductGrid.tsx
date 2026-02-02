import { useState } from 'react';
import { Product, useUpdateProductOrder } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { useAuth } from '@/hooks/useAuth';
import EditableProductCard from './EditableProductCard';
import ProductCard from './ProductCard';
import { toast } from 'sonner';

interface EditableBolsosProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const EditableBolsosProductGrid = ({ products, onProductClick }: EditableBolsosProductGridProps) => {
  const { isAdmin } = useAuth();
  const { isEditMode } = useAdminContext();
  const updateProductOrder = useUpdateProductOrder();

  // Pick & place state
  const [movingProductId, setMovingProductId] = useState<string | null>(null);
  const [insertBeforeId, setInsertBeforeId] = useState<string | null>(null);

  // Pattern: (2, 1, 2, 1, 2, 1...) - every 3rd product is featured (full width)
  const isFeatured = (index: number) => {
    return index % 3 === 2;
  };

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

    const newOrder = [...products];
    const [movedProduct] = newOrder.splice(movingIndex, 1);
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

  // If not admin or not in edit mode, render standard grid
  if (!isAdmin || !isEditMode) {
    return (
      <div className="grid grid-cols-2 gap-3 px-3">
        {products.map((product, index) => {
          const featured = isFeatured(index);
          
          if (isAdmin) {
            return (
              <div
                key={product.id}
                className={featured ? 'col-span-2' : 'col-span-1'}
              >
                <EditableProductCard
                  product={product}
                  onClick={() => onProductClick(product)}
                  index={index}
                  featured={featured}
                  hideBrandName
                />
              </div>
            );
          }
          
          return (
            <div
              key={product.id}
              className={featured ? 'col-span-2' : 'col-span-1'}
            >
              <ProductCard
                product={product}
                onClick={() => onProductClick(product)}
                index={index}
                featured={featured}
                hideBrandName
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
      {movingProductId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          Mueve el ratón sobre otra prenda y haz clic para colocar • ESC para cancelar
        </div>
      )}

      <div 
        className="grid grid-cols-2 gap-3 px-3"
        onClick={(e) => {
          if (movingProductId && e.target === e.currentTarget) {
            handleCancelMove();
          }
        }}
      >
        {products.map((product, index) => {
          const featured = isFeatured(index);
          const isMoving = product.id === movingProductId;
          const isInsertTarget = product.id === insertBeforeId;
          
          return (
            <div
              key={product.id}
              className={`relative ${featured ? 'col-span-2' : 'col-span-1'} ${isMoving ? 'opacity-40 scale-95' : ''} transition-all duration-200`}
              onMouseEnter={() => handleHoverProduct(product.id)}
              onClick={() => {
                if (movingProductId && !isMoving) {
                  handleConfirmMove();
                }
              }}
            >
              {isInsertTarget && movingProduct && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-primary rounded-full z-10 animate-pulse" />
              )}
              
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
                featured={featured}
                hideBrandName
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

export default EditableBolsosProductGrid;
