import { useState, useRef } from 'react';
import { Product, useUpdateProduct, useDeleteProduct, useUploadImage, ProductCategory } from '@/hooks/useProducts';
import { useAdminContext } from '@/contexts/AdminContext';
import { Brand, brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, X, Eye, EyeOff, ImagePlus, Loader2 } from 'lucide-react';

interface EditableProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
  featured?: boolean;
  hideBrandName?: boolean;
  onStartMove?: (productId: string) => void;
  isInMoveMode?: boolean;
}

const categoryLabels: Record<ProductCategory, string> = {
  'ropa': 'Ropa',
  'bolsos': 'Bolsos',
  'plumiferos': 'Plumíferos',
  'camisetas': 'Camisetas',
  'jeans': 'Espacio Jeans',
};

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

  const category = product.brand ? (brandCategories[product.brand] || 'exclusivo') : 'exclusivo';
  const displayBrandName = product.brand ? getBrandDisplayName(product.brand) : 'ESPACIO JEANS';
  const altText = `Prenda ${category} de ${displayBrandName} para mujer - La Loggia boutique Alicante`;

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateProduct.mutateAsync({ id: product.id, isActive: !product.isActive });
      toast.success(product.isActive ? 'Producto desactivado' : 'Producto activado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleChangeBrand = async (newBrand: Brand) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, brand: newBrand });
      toast.success(`Marca cambiada a ${getBrandDisplayName(newBrand)}`);
    } catch {
      toast.error('Error al cambiar marca');
    }
  };

  const handleChangeCategory = async (newCategory: ProductCategory) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, category: newCategory });
      toast.success(`Categoría cambiada`);
    } catch {
      toast.error('Error al cambiar categoría');
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
      await updateProduct.mutateAsync({ id: product.id, imageUrl });
      toast.success('Imagen reemplazada');
    } catch {
      toast.error('Error al reemplazar imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCardClick = () => {
    if (isEditMode && !showEditPanel) {
      setShowEditPanel(true);
    } else if (!isEditMode) {
      onClick();
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (isEditMode && onStartMove && !isInMoveMode) {
      e.preventDefault();
      onStartMove(product.id);
    }
  };

  // Build visibility summary
  const visibilityParts: string[] = [];
  if (product.showInLatest) visibilityParts.push('📰');
  if (product.showInSection) visibilityParts.push('📂');
  if (product.showInBrand) visibilityParts.push('🏷️');
  const visibilitySummary = visibilityParts.length > 0 ? visibilityParts.join(' ') : '⚠️';

  const cardContent = (
    <article 
      className={`relative animate-slide-up opacity-0 cursor-pointer group ${isInMoveMode ? 'cursor-crosshair' : ''}`}
      onClick={handleCardClick}
      onContextMenu={handleRightClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceImage}
      />

      {/* Visibility indicator badge - only in edit mode */}
      {isEditMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/80 text-background text-[10px] font-medium">
          {visibilitySummary}
        </div>
      )}
      
      {/* Quick action buttons in edit mode */}
      {isEditMode && !showEditPanel && (
        <div className="absolute top-10 right-2 z-20 flex flex-col items-center gap-1">
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm" onClick={handleToggleActive} title={product.isActive ? 'Desactivar' : 'Activar'}>
            {product.isActive ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} disabled={isUploading} title="Reemplazar imagen">
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/90 hover:bg-background shadow-sm text-destructive hover:text-destructive" onClick={handleDelete} title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {isEditMode && !product.isActive && (
        <div className="absolute inset-0 bg-foreground/40 z-10 pointer-events-none" />
      )}

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
          {product.category === 'jeans' || !product.brand ? 'ESPACIO JEANS' : displayBrandName}
        </p>
      )}
      
      {showEditPanel && (
        <>
          <div className="fixed inset-0 z-[160] bg-foreground/30" onClick={(e) => { e.stopPropagation(); setShowEditPanel(false); }} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[170] bg-background rounded-xl shadow-xl p-4 w-[90vw] max-w-xs animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Editar producto</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowEditPanel(false)} className="h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <div className="relative">
                <img src={product.imageUrl} alt={product.brand} className="w-16 h-20 object-cover rounded" />
                <Button variant="secondary" size="icon" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full shadow" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Activo</span>
                  <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive({ stopPropagation: () => {} } as React.MouseEvent)} />
                </div>
                <p className="text-xs text-muted-foreground">{product.createdAt.toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Select value={product.brand} onValueChange={(v) => handleChangeBrand(v as Brand)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{getBrandDisplayName(brand)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={product.category} onValueChange={(v) => handleChangeCategory(v as ProductCategory)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['ropa', 'bolsos', 'plumiferos', 'camisetas', 'jeans'] as ProductCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Visibility toggles */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground font-medium">Visibilidad</p>
                <label className="flex items-center justify-between text-xs">
                  <span>📰 Novedades</span>
                  <Switch checked={product.showInLatest} onCheckedChange={(v) => updateProduct.mutateAsync({ id: product.id, showInLatest: v })} />
                </label>
                <label className="flex items-center justify-between text-xs">
                  <span>📂 Sección</span>
                  <Switch checked={product.showInSection} onCheckedChange={(v) => updateProduct.mutateAsync({ id: product.id, showInSection: v })} />
                </label>
                <label className="flex items-center justify-between text-xs">
                  <span>🏷️ Marca</span>
                  <Switch checked={product.showInBrand} onCheckedChange={(v) => updateProduct.mutateAsync({ id: product.id, showInBrand: v })} />
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditPanel(false)}>Cerrar</Button>
              <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        </>
      )}
    </article>
  );

  return cardContent;
};

export default EditableProductCard;
