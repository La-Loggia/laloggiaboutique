import { useState } from 'react';
import { Product, useUpdateProduct, useDeleteProduct, ProductVisibility, ProductCategory } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { Brand, brands } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, GripVertical, X, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditableProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
  featured?: boolean;
  hideBrandName?: boolean;
  isDraggable?: boolean;
}

const visibilityLabels: Record<ProductVisibility, string> = {
  'all': 'Toda la web',
  'brand_only': 'Solo marca',
  'latest_only': 'Solo novedades',
};

const categoryLabels: Record<ProductCategory, string> = {
  'ropa': 'Ropa',
  'bolsos': 'Bolsos',
};

// Map brand names to descriptive categories for better alt text
const brandCategories: Record<string, string> = {
  'MOOR': 'elegante italiano',
  'SaintTropez': 'escandinavo contemporáneo',
  'DiLei': 'italiano exclusivo',
  'Mela': 'británico con estilo',
  'Pecatto': 'moderno con personalidad',
  'Dixie': 'urbano italiano',
  'Replay': 'denim premium',
  'RueMadam': 'elegancia parisina',
  'JOTT': 'técnico de alta gama',
};

const EditableProductCard = ({ 
  product, 
  onClick, 
  index, 
  featured = false, 
  hideBrandName = false,
  isDraggable = false 
}: EditableProductCardProps) => {
  const { isEditMode } = useAdminContext();
  const [showEditPanel, setShowEditPanel] = useState(false);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: product.id,
    disabled: !isEditMode || !isDraggable
  });

  const style = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  } : {};

  const category = brandCategories[product.brand] || 'exclusivo';
  const altText = `Prenda ${category} de ${product.brand} para mujer - La Loggia boutique Alicante`;

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        isActive: !product.isActive,
      });
      toast.success(product.isActive ? 'Producto desactivado' : 'Producto activado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleChangeBrand = async (newBrand: Brand) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        brand: newBrand,
      });
      toast.success(`Marca cambiada a ${newBrand}`);
    } catch {
      toast.error('Error al cambiar marca');
    }
  };

  const handleChangeCategory = async (newCategory: ProductCategory) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        category: newCategory,
      });
      toast.success(`Categoría cambiada`);
    } catch {
      toast.error('Error al cambiar categoría');
    }
  };

  const handleChangeVisibility = async (newVisibility: ProductVisibility) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        visibility: newVisibility,
      });
      toast.success(`Visibilidad actualizada`);
    } catch {
      toast.error('Error al cambiar visibilidad');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleCardClick = () => {
    if (isEditMode && !showEditPanel) {
      setShowEditPanel(true);
    } else if (!isEditMode) {
      onClick();
    }
  };

  return (
    <article 
      ref={setNodeRef}
      style={style}
      className={`relative animate-slide-up opacity-0 cursor-pointer group ${isDragging ? 'cursor-grabbing' : ''}`}
      onClick={handleCardClick}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Drag handle - only visible in edit mode with draggable */}
      {isEditMode && isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 p-1.5 bg-foreground/80 text-background rounded cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      
      {/* Quick action buttons in edit mode */}
      {isEditMode && !showEditPanel && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm"
            onClick={handleToggleActive}
          >
            {product.isActive ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Inactive overlay */}
      {isEditMode && !product.isActive && (
        <div className="absolute inset-0 bg-foreground/40 z-10 pointer-events-none" />
      )}

      {/* Edit mode indicator border */}
      <div className={`relative overflow-hidden bg-secondary ${featured ? 'aspect-[9/16]' : ''} ${isEditMode ? 'ring-2 ring-primary/50' : ''}`}>
        <img
          src={product.imageUrl}
          alt={altText}
          className={`product-image transition-transform duration-500 group-hover:scale-105 ${featured ? 'object-cover w-full h-full' : ''}`}
          loading="lazy"
          itemProp="image"
          style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
        />
        {!isEditMode && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        )}
      </div>
      
      {!hideBrandName && (
        <p className={`brand-name text-center ${featured ? 'text-sm mt-2' : ''}`} itemProp="brand">
          {product.brand}
        </p>
      )}
      
      <meta itemProp="name" content={`Moda ${product.brand} mujer en La Loggia`} />
      <meta itemProp="description" content={`${product.brand} - Colección de moda femenina ${category} disponible en La Loggia`} />
      
      {/* Edit panel overlay */}
      {showEditPanel && (
        <>
          <div 
            className="fixed inset-0 z-[160] bg-foreground/30"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditPanel(false);
            }}
          />
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[170] bg-background rounded-xl shadow-xl p-4 w-[90vw] max-w-xs animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Editar producto</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditPanel(false)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <img
                src={product.imageUrl}
                alt={product.brand}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Activo</span>
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={() => handleToggleActive({ stopPropagation: () => {} } as React.MouseEvent)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.createdAt.toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Select value={product.brand} onValueChange={(v) => handleChangeBrand(v as Brand)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={product.category} onValueChange={(v) => handleChangeCategory(v as ProductCategory)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['ropa', 'bolsos'] as ProductCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={product.visibility} onValueChange={(v) => handleChangeVisibility(v as ProductVisibility)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['all', 'brand_only', 'latest_only'] as ProductVisibility[]).map((vis) => (
                    <SelectItem key={vis} value={vis}>{visibilityLabels[vis]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditPanel(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </article>
  );
};

export default EditableProductCard;
