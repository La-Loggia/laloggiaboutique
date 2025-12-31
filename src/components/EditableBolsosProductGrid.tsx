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

interface EditableBolsosProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const EditableBolsosProductGrid = ({ products, onProductClick }: EditableBolsosProductGridProps) => {
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

  // Pattern: (2, 1, 2, 1, 2, 1...) - every 3rd product is featured (full width)
  const isFeatured = (index: number) => {
    return index % 3 === 2;
  };

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
        <div className="grid grid-cols-2 gap-3 px-3">
          {products.map((product, index) => {
            const featured = isFeatured(index);
            
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

export default EditableBolsosProductGrid;
