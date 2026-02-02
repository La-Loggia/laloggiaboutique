import { useState, useRef } from 'react';
import { Product, useUpdateProduct, useDeleteProduct, useUploadImage, ProductVisibility, ProductCategory } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { Brand, brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, X, Eye, EyeOff, Store, Sparkles, Globe, ImagePlus, Loader2, Move } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface EditableProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
  featured?: boolean;
  hideBrandName?: boolean;
  onStartMove?: (productId: string) => void;
  isInMoveMode?: boolean;
}

const visibilityLabels: Record<ProductVisibility, string> = {
  'all': 'Toda la web',
  'brand_only': 'Solo marca',
  'latest_only': 'Solo novedades',
};

const categoryLabels: Record<ProductCategory, string> = {
  'ropa': 'Ropa',
  'bolsos': 'Bolsos',
  'plumiferos': 'Plumíferos',
  'camisetas': 'Camisetas',
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

const visibilityIcons: Record<ProductVisibility, React.ReactNode> = {
  'all': <Globe className="w-3 h-3" />,
  'brand_only': <Store className="w-3 h-3" />,
  'latest_only': <Sparkles className="w-3 h-3" />,
};

const visibilityColors: Record<ProductVisibility, string> = {
  'all': 'bg-green-500',
  'brand_only': 'bg-blue-500',
  'latest_only': 'bg-amber-500',
};

const EditableProductCard = ({ 
  product, 
  onClick, 
  index, 
  featured = false, 
  hideBrandName = false,
  onStartMove,
  isInMoveMode = false
}: EditableProductCardProps) => {
  const { isEditMode } = useAdminContext();
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadImage();


  const category = brandCategories[product.brand] || 'exclusivo';
  const displayBrandName = getBrandDisplayName(product.brand);
  const altText = `Prenda ${category} de ${displayBrandName} para mujer - La Loggia boutique Alicante`;

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
      toast.success(`Marca cambiada a ${getBrandDisplayName(newBrand)}`);
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

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      await updateProduct.mutateAsync({
        id: product.id,
        imageUrl,
      });
      toast.success('Imagen reemplazada');
    } catch {
      toast.error('Error al reemplazar imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCardClick = () => {
    if (isEditMode && !showEditPanel) {
      setShowEditPanel(true);
    } else if (!isEditMode) {
      onClick();
    }
  };

  const cardContent = (

    <article 
      className={`relative animate-slide-up opacity-0 cursor-pointer group ${isInMoveMode ? 'cursor-crosshair' : ''}`}
      onClick={handleCardClick}
    >
      {/* Hidden file input for image replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceImage}
      />

      {/* Visibility indicator badge - only in edit mode */}
      {isEditMode && (
        <div 
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-medium ${visibilityColors[product.visibility]}`}
          title={visibilityLabels[product.visibility]}
        >
          {visibilityIcons[product.visibility]}
          <span className="hidden sm:inline">{visibilityLabels[product.visibility]}</span>
        </div>
      )}
      
      {/* Quick action buttons in edit mode */}
      {isEditMode && !showEditPanel && (
        <div className="absolute top-10 right-2 z-20 flex flex-col items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm"
            onClick={handleToggleActive}
            title={product.isActive ? 'Desactivar' : 'Activar'}
          >
            {product.isActive ? (
              <Eye className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            title="Reemplazar imagen"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImagePlus className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Eliminar"
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
          style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
        />
        {!isEditMode && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        )}
      </div>
      
      {!hideBrandName && (
        <p className={`brand-name text-center ${featured ? 'text-sm mt-2' : ''}`}>
          {displayBrandName}
        </p>
      )}
      
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
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.brand}
                  className="w-16 h-20 object-cover rounded"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full shadow"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ImagePlus className="w-3 h-3" />
                  )}
                </Button>
              </div>
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
                    <SelectItem key={brand} value={brand}>{getBrandDisplayName(brand)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={product.category} onValueChange={(v) => handleChangeCategory(v as ProductCategory)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['ropa', 'bolsos', 'plumiferos', 'camisetas'] as ProductCategory[]).map((cat) => (
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

  // Wrap with context menu only in edit mode
  if (isEditMode) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 z-[200] bg-popover">
          <ContextMenuItem onClick={() => handleToggleActive({} as React.MouseEvent)}>
            {product.isActive ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Desactivar
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Activar
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => fileInputRef.current?.click()}>
            <ImagePlus className="w-4 h-4 mr-2" />
            Reemplazar imagen
          </ContextMenuItem>
          {onStartMove && !isInMoveMode && (
            <ContextMenuItem onClick={() => onStartMove(product.id)}>
              <Move className="w-4 h-4 mr-2" />
              Mover posición
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Store className="w-4 h-4 mr-2" />
              Marca
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="z-[210] bg-popover">
              {brands.map((brand) => (
                <ContextMenuItem 
                  key={brand} 
                  onClick={() => handleChangeBrand(brand)}
                  className={product.brand === brand ? 'bg-accent' : ''}
                >
                  {getBrandDisplayName(brand)}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              {visibilityIcons[product.visibility]}
              <span className="ml-2">Visibilidad</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="z-[210] bg-popover">
              {(['all', 'brand_only', 'latest_only'] as ProductVisibility[]).map((vis) => (
                <ContextMenuItem 
                  key={vis} 
                  onClick={() => handleChangeVisibility(vis)}
                  className={product.visibility === vis ? 'bg-accent' : ''}
                >
                  <span className="flex items-center gap-2">
                    {visibilityIcons[vis]}
                    {visibilityLabels[vis]}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              Categoría
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="z-[210] bg-popover">
              {(['ropa', 'bolsos', 'plumiferos', 'camisetas'] as ProductCategory[]).map((cat) => (
                <ContextMenuItem 
                  key={cat} 
                  onClick={() => handleChangeCategory(cat)}
                  className={product.category === cat ? 'bg-accent' : ''}
                >
                  {categoryLabels[cat]}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => handleDelete()}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return cardContent;
};

export default EditableProductCard;
