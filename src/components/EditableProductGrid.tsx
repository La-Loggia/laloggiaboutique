import { useCallback } from 'react';
import { Product, useUpdateProductOrder } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { useAuth } from '@/hooks/useAuth';
import EditableProductCard from './EditableProductCard';
import ProductCard from './ProductCard';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface EditableProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const EditableProductGrid = ({ products, onProductClick }: EditableProductGridProps) => {
  const { isAdmin } = useAuth();
  const { isEditMode } = useAdminContext();
  const updateProductOrder = useUpdateProductOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getProductLayout = useCallback((index: number) => {
    // Mobile pattern: every 5th product is featured (full width on 2-col grid)
    const mobilePositionInPattern = index % 5;
    const isMobileFeatured = mobilePositionInPattern === 4;
    
    // Desktop pattern:
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && products.length > 0) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);
      
      const newOrder = arrayMove(products, oldIndex, newIndex);
      
      const updates = newOrder.map((p, index) => ({
        id: p.id,
        displayOrder: index + 1,
      }));
      
      try {
        await updateProductOrder.mutateAsync(updates);
        toast.success('Orden guardado');
      } catch {
        toast.error('Error al guardar el orden');
      }
    }
  };

  // If not admin or not in edit mode, render standard grid
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

  // Edit mode with drag & drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={products.map(p => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3">
          {products.map((product, index) => {
            const { isMobileFeatured, isDesktopFeatured } = getProductLayout(index);
            const colSpanClass = `${isMobileFeatured ? 'col-span-2' : 'col-span-1'} ${isDesktopFeatured ? 'md:col-span-2' : 'md:col-span-1'}`;
            
            return (
              <div key={product.id} className={colSpanClass}>
                <EditableProductCard
                  product={product}
                  onClick={() => onProductClick(product)}
                  index={index}
                  featured={isMobileFeatured || isDesktopFeatured}
                  isDraggable
                />
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default EditableProductGrid;
