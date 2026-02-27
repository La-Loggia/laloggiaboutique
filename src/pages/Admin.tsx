import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImage, useUpdateProductOrder, Product, ProductCategory } from '@/hooks/useProducts';
import { brands, Brand } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, Upload, Trash2, Plus, Images, Pencil, GripVertical, ChevronDown, ChevronRight, X, Eye } from 'lucide-react';
import ProductImageManager from '@/components/ProductImageManager';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Visibility Presets ---
interface VisibilityState {
  showInLatest: boolean;
  showInSection: boolean;
  showInBrand: boolean;
}

interface VisibilityPreset {
  label: string;
  description: string;
  state: VisibilityState;
}

const visibilityPresets: VisibilityPreset[] = [
  { label: 'Toda la web', description: 'Novedades + Sección + Marca', state: { showInLatest: true, showInSection: true, showInBrand: true } },
  { label: 'Sección + Marca', description: 'Solo en su sección y marca', state: { showInLatest: false, showInSection: true, showInBrand: true } },
  { label: 'Sección + Novedades', description: 'Sin página de marca', state: { showInLatest: true, showInSection: true, showInBrand: false } },
  { label: 'Solo sección', description: 'Solo en su categoría', state: { showInLatest: false, showInSection: true, showInBrand: false } },
  { label: 'Solo marca', description: 'Solo en la página de marca', state: { showInLatest: false, showInSection: false, showInBrand: true } },
  { label: 'Solo novedades', description: 'Solo en novedades', state: { showInLatest: true, showInSection: false, showInBrand: false } },
];

const getMatchingPreset = (state: VisibilityState): string | null => {
  const match = visibilityPresets.find(
    p => p.state.showInLatest === state.showInLatest && 
         p.state.showInSection === state.showInSection && 
         p.state.showInBrand === state.showInBrand
  );
  return match?.label ?? null;
};

const categoryLabels: Record<ProductCategory, string> = {
  'ropa': 'Novedades',
  'bolsos': 'Bolsos',
  'plumiferos': 'Plumíferos',
  'camisetas': 'Camisetas',
  'jeans': 'Espacio Jeans',
};

// --- Visibility Toggle Component ---
const VisibilityToggles = ({ 
  showInLatest, showInSection, showInBrand, showBrandToggle,
  onChange 
}: VisibilityState & { showBrandToggle: boolean; onChange: (state: Partial<VisibilityState>) => void }) => {
  const toggles = [
    { key: 'showInLatest' as const, label: 'Novedades', icon: '📰' },
    { key: 'showInSection' as const, label: 'Sección', icon: '📂' },
    ...(showBrandToggle ? [{ key: 'showInBrand' as const, label: 'Marca', icon: '🏷️' }] : []),
  ];
  const state = { showInLatest, showInSection, showInBrand };

  return (
    <div className="flex gap-1.5">
      {toggles.map(t => (
        <button
          key={t.key}
          onClick={() => onChange({ [t.key]: !state[t.key] })}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            state[t.key]
              ? 'bg-foreground text-background'
              : 'bg-secondary text-muted-foreground'
          }`}
          title={`${state[t.key] ? 'Ocultar de' : 'Mostrar en'} ${t.label}`}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Sortable Product Row ---
interface SortableProductProps {
  product: Product;
  onToggleActive: (product: Product) => void;
  onDelete: (id: string) => void;
  onManageImages: (product: Product) => void;
  onReplaceImage: (product: Product) => void;
  onChangeBrand: (product: Product, newBrand: Brand) => void;
  onChangeVisibility: (product: Product, state: Partial<VisibilityState>) => void;
}

const SortableProduct = ({ product, onToggleActive, onDelete, onManageImages, onReplaceImage, onChangeBrand, onChangeVisibility }: SortableProductProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const showBrand = product.category !== 'jeans' && product.brand !== null;

  return (
    <div ref={setNodeRef} style={style} className="bg-background/50 rounded-lg p-3">
      <div className="flex gap-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground self-start mt-2"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="relative shrink-0">
          <img
            src={product.imageUrl}
            alt={product.brand}
            className="w-16 h-20 md:w-20 md:h-24 object-cover rounded"
          />
          <button
            onClick={() => onReplaceImage(product)}
            className="absolute -top-1 -right-1 p-1.5 bg-foreground text-background rounded-full hover:bg-foreground/80"
            title="Reemplazar imagen"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              {product.createdAt.toLocaleDateString('es-ES')}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onManageImages(product)}
                title="Gestionar imágenes"
              >
                <Images className="w-4 h-4" />
              </Button>
              <Switch
                checked={product.isActive}
                onCheckedChange={() => onToggleActive(product)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product.id)}
                className="text-destructive hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {showBrand && (
            <div className="mb-2">
              <Select 
                value={product.brand} 
                onValueChange={(v) => onChangeBrand(product, v as Brand)}
              >
                <SelectTrigger className="h-8 text-xs px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="text-xs">{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <VisibilityToggles
            showInLatest={product.showInLatest}
            showInSection={product.showInSection}
            showInBrand={product.showInBrand}
            showBrandToggle={showBrand}
            onChange={(state) => onChangeVisibility(product, state)}
          />
        </div>
      </div>
    </div>
  );
};

// --- Upload Dialog ---
interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadDialog = ({ open, onClose }: UploadDialogProps) => {
  const [step, setStep] = useState<'section' | 'details'>('section');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand>('MOOR');
  const [visibility, setVisibility] = useState<VisibilityState>({ showInLatest: true, showInSection: true, showInBrand: true });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadImage();
  const createProduct = useCreateProduct();

  const resetState = () => {
    setStep('section');
    setSelectedCategory(null);
    setSelectedBrand('MOOR');
    setVisibility({ showInLatest: true, showInSection: true, showInBrand: true });
    setIsUploading(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelectSection = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    if (cat === 'jeans') {
      setVisibility({ showInLatest: true, showInSection: true, showInBrand: false });
    }
    setStep('details');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(selectedFile);
      await createProduct.mutateAsync({
        brand: selectedCategory === 'jeans' ? null : selectedBrand,
        imageUrl,
        category: selectedCategory,
        showInLatest: visibility.showInLatest,
        showInSection: visibility.showInSection,
        showInBrand: selectedCategory === 'jeans' ? false : visibility.showInBrand,
      });
      toast.success('Prenda añadida correctamente');
      handleClose();
    } catch (error) {
      toast.error('Error al subir la imagen');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const showBrand = selectedCategory !== 'jeans';
  const matchingPreset = getMatchingPreset(visibility);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-wide">
            {step === 'section' ? 'Selecciona la sección' : `Nueva prenda — ${categoryLabels[selectedCategory!]}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'section' ? (
          <div className="grid grid-cols-1 gap-3 py-2">
            {(['ropa', 'bolsos', 'plumiferos', 'camisetas', 'jeans'] as ProductCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelectSection(cat)}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <span className="font-medium text-sm">{categoryLabels[cat]}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <button
              onClick={() => { setStep('section'); setSelectedFile(null); setPreviewUrl(null); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Cambiar sección
            </button>

            {/* Brand selector */}
            {showBrand && (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marca</label>
                <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v as Brand)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Visibility - Presets */}
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                ¿Dónde se muestra?
              </label>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-2 gap-2">
                {visibilityPresets
                  .filter(p => showBrand || !p.state.showInBrand) // Hide brand presets for jeans
                  .map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setVisibility(preset.state)}
                    className={`text-left p-2.5 rounded-lg border transition-colors ${
                      matchingPreset === preset.label
                        ? 'border-foreground bg-foreground/5'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <p className="text-xs font-medium">{preset.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{preset.description}</p>
                  </button>
                ))}
              </div>

              {/* Individual toggles */}
              <div className="flex flex-wrap gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={visibility.showInLatest} onCheckedChange={(v) => setVisibility(s => ({ ...s, showInLatest: v }))} />
                  📰 Novedades
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={visibility.showInSection} onCheckedChange={(v) => setVisibility(s => ({ ...s, showInSection: v }))} />
                  📂 Sección
                </label>
                {showBrand && (
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={visibility.showInBrand} onCheckedChange={(v) => setVisibility(s => ({ ...s, showInBrand: v }))} />
                    🏷️ Marca
                  </label>
                )}
              </div>
            </div>

            {/* Image selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Imagen</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Preview" className="w-32 h-40 object-cover rounded-lg" />
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-dashed"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Seleccionar imagen
                </Button>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {isUploading ? 'Subiendo...' : 'Subir prenda'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Main Admin Page ---
const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  
  const [collapsedSections, setCollapsedSections] = useState<Record<ProductCategory, boolean>>({
    ropa: false,
    bolsos: false,
    plumiferos: false,
    camisetas: false,
    jeans: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);
  const [replacingProduct, setReplacingProduct] = useState<Product | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadImage();
  const updateProductOrder = useUpdateProductOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const productsByCategory = (category: ProductCategory) =>
    products?.filter(p => p.category === category) || [];

  const toggleSection = (cat: ProductCategory) => {
    setCollapsedSections(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-foreground mb-2">Acceso denegado</h1>
          <p className="text-muted-foreground mb-4">No tienes permisos de administrador.</p>
          <Button onClick={() => signOut()} variant="outline">
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  const handleReplaceImage = (product: Product) => {
    setReplacingProduct(product);
    replaceImageInputRef.current?.click();
  };

  const handleReplaceImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingProduct) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      await updateProduct.mutateAsync({ id: replacingProduct.id, imageUrl });
      toast.success('Imagen reemplazada correctamente');
    } catch (error) {
      toast.error('Error al reemplazar la imagen');
    } finally {
      setIsUploading(false);
      setReplacingProduct(null);
      if (replaceImageInputRef.current) replaceImageInputRef.current.value = '';
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, isActive: !product.isActive });
      toast.success(product.isActive ? 'Prenda desactivada' : 'Prenda activada');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleChangeBrand = async (product: Product, newBrand: Brand) => {
    if (product.brand === newBrand) return;
    try {
      await updateProduct.mutateAsync({ id: product.id, brand: newBrand });
      toast.success(`Marca cambiada a ${newBrand}`);
    } catch (error) {
      toast.error('Error al cambiar la marca');
    }
  };

  const handleChangeVisibility = async (product: Product, state: Partial<VisibilityState>) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, ...state });
      toast.success('Visibilidad actualizada');
    } catch (error) {
      toast.error('Error al cambiar la visibilidad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta prenda?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Prenda eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDragEnd = (category: ProductCategory) => async (event: DragEndEvent) => {
    const { active, over } = event;
    const categoryProducts = productsByCategory(category);
    
    if (over && active.id !== over.id && categoryProducts.length > 0) {
      const oldIndex = categoryProducts.findIndex((p) => p.id === active.id);
      const newIndex = categoryProducts.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(categoryProducts, oldIndex, newIndex);
      
      const updates = newOrder.map((p, index) => ({
        id: p.id,
        displayOrder: index + 1,
      }));
      
      try {
        await updateProductOrder.mutateAsync(updates);
        toast.success('Orden guardado');
      } catch (error) {
        toast.error('Error al guardar el orden');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-serif text-xl tracking-wide text-foreground">LA LOGGIA</h1>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nueva prenda
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageSelect}
        className="hidden"
      />

      <main className="p-4 space-y-4">
        {productsLoading ? (
          <p className="text-muted-foreground text-center py-8">Cargando...</p>
        ) : (
          (['ropa', 'bolsos', 'plumiferos', 'camisetas', 'jeans'] as ProductCategory[]).map((category) => {
            const categoryProducts = productsByCategory(category);
            const isCollapsed = collapsedSections[category];
            
            return (
              <section key={category} className="bg-secondary/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans text-sm font-medium uppercase tracking-wider">
                      {categoryLabels[category]}
                    </h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {categoryProducts.length}
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                {!isCollapsed && (
                  <div className="px-4 pb-4">
                    {categoryProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4 text-sm">
                        No hay prendas en esta sección
                      </p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd(category)}
                      >
                        <SortableContext
                          items={categoryProducts.map(p => p.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {categoryProducts.map((product) => (
                              <SortableProduct
                                key={product.id}
                                product={product}
                                onToggleActive={handleToggleActive}
                                onDelete={handleDelete}
                                onManageImages={setManagingProduct}
                                onReplaceImage={handleReplaceImage}
                                onChangeBrand={handleChangeBrand}
                                onChangeVisibility={handleChangeVisibility}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      <UploadDialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} />

      {managingProduct && (
        <ProductImageManager
          product={managingProduct}
          onClose={() => setManagingProduct(null)}
        />
      )}
    </div>
  );
};

export default Admin;
