import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImage, useUpdateProductOrder, Product, ProductVisibility, ProductCategory } from '@/hooks/useProducts';
import { useCampaigns, useCreateCampaign, useSetActiveCampaign } from '@/hooks/useCampaigns';
import { brands, Brand } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { LogOut, Upload, Trash2, Plus, Images, Pencil, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
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

interface SortableProductProps {
  product: Product;
  onToggleActive: (product: Product) => void;
  onDelete: (id: string) => void;
  onManageImages: (product: Product) => void;
  onReplaceImage: (product: Product) => void;
  onChangeBrand: (product: Product, newBrand: Brand) => void;
  onChangeVisibility: (product: Product, visibility: ProductVisibility) => void;
  onChangeCategory: (product: Product, category: ProductCategory) => void;
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
  'jeans': 'Espacio Jeans',
};

const SortableProduct = ({ product, onToggleActive, onDelete, onManageImages, onReplaceImage, onChangeBrand, onChangeVisibility, onChangeCategory }: SortableProductProps) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-secondary/30 rounded-lg p-3"
    >
      {/* Mobile: Stack layout */}
      <div className="flex gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground self-start mt-2"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        {/* Image with replace button */}
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
        
        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Top row: Date + Actions */}
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
          
          {/* Selectors row - grid for mobile */}
          <div className="grid grid-cols-3 gap-1.5">
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
            <Select 
              value={product.category} 
              onValueChange={(v) => onChangeCategory(product, v as ProductCategory)}
            >
              <SelectTrigger className="h-8 text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['ropa', 'bolsos', 'plumiferos', 'camisetas', 'jeans'] as ProductCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">{categoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={product.visibility} 
              onValueChange={(v) => onChangeVisibility(product, v as ProductVisibility)}
            >
              <SelectTrigger className="h-8 text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['all', 'brand_only', 'latest_only'] as ProductVisibility[]).map((vis) => (
                  <SelectItem key={vis} value={vis} className="text-xs">{visibilityLabels[vis]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedBrand, setSelectedBrand] = useState<Brand>('MOOR');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ropa');
  const [collapsedSections, setCollapsedSections] = useState<Record<ProductCategory, boolean>>({
    ropa: false,
    bolsos: false,
    plumiferos: false,
    camisetas: false,
    jeans: false,
  });
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);
  const [replacingProduct, setReplacingProduct] = useState<Product | null>(null);
  
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: campaigns } = useCampaigns();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadImage();
  const createCampaign = useCreateCampaign();
  const setActiveCampaign = useSetActiveCampaign();
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

  // Group products by category
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      const activeCampaign = campaigns?.find(c => c.isActive);
      
      await createProduct.mutateAsync({
        brand: selectedBrand,
        imageUrl,
        campaignId: activeCampaign?.id,
        category: selectedCategory,
      });
      
      toast.success('Prenda añadida correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      await updateProduct.mutateAsync({
        id: replacingProduct.id,
        imageUrl,
      });
      toast.success('Imagen reemplazada correctamente');
    } catch (error) {
      toast.error('Error al reemplazar la imagen');
      console.error(error);
    } finally {
      setIsUploading(false);
      setReplacingProduct(null);
      if (replaceImageInputRef.current) {
        replaceImageInputRef.current.value = '';
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        isActive: !product.isActive,
      });
      toast.success(product.isActive ? 'Prenda desactivada' : 'Prenda activada');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleChangeBrand = async (product: Product, newBrand: Brand) => {
    if (product.brand === newBrand) return;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        brand: newBrand,
      });
      toast.success(`Marca cambiada a ${newBrand}`);
    } catch (error) {
      toast.error('Error al cambiar la marca');
    }
  };

  const handleChangeVisibility = async (product: Product, visibility: ProductVisibility) => {
    if (product.visibility === visibility) return;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        visibility,
      });
      toast.success(`Visibilidad cambiada a "${visibilityLabels[visibility]}"`);
    } catch (error) {
      toast.error('Error al cambiar la visibilidad');
    }
  };

  const handleChangeCategory = async (product: Product, category: ProductCategory) => {
    if (product.category === category) return;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        category,
      });
      toast.success(`Categoría cambiada a "${categoryLabels[category]}"`);
    } catch (error) {
      toast.error('Error al cambiar la categoría');
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

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;
    
    try {
      await createCampaign.mutateAsync(newCampaignName);
      setNewCampaignName('');
      toast.success('Campaña creada');
    } catch (error) {
      toast.error('Error al crear campaña');
    }
  };

  const handleSetActiveCampaign = async (campaignId: string) => {
    try {
      await setActiveCampaign.mutateAsync(campaignId);
      toast.success('Campaña activada');
    } catch (error) {
      toast.error('Error al activar campaña');
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-serif text-xl tracking-wide text-foreground">LA LOGGIA</h1>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Upload Section */}
        <section className="bg-secondary/30 rounded-lg p-4">
          <h2 className="font-sans text-sm font-medium uppercase tracking-wider mb-4">
            Subir Nueva Prenda
          </h2>
          
          <div className="flex gap-3 mb-4">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sección" />
              </SelectTrigger>
              <SelectContent>
                {(['ropa', 'bolsos', 'plumiferos', 'camisetas', 'jeans'] as ProductCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory !== 'jeans' && (
              <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v as Brand)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}
          </Button>
        </section>

        {/* Hidden input for replacing images */}
        <input
          ref={replaceImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplaceImageSelect}
          className="hidden"
        />

        {/* Campaigns Section */}
        <section className="bg-secondary/30 rounded-lg p-4">
          <h2 className="font-sans text-sm font-medium uppercase tracking-wider mb-4">
            Campañas
          </h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nueva campaña..."
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateCampaign} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {campaigns?.map((campaign) => (
              <div
                key={campaign.id}
                className={`flex items-center justify-between p-3 rounded-md ${
                  campaign.isActive ? 'bg-foreground/10 border border-foreground/20' : 'bg-secondary'
                }`}
              >
                <span className="text-sm">{campaign.name}</span>
                <Button
                  variant={campaign.isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSetActiveCampaign(campaign.id)}
                >
                  {campaign.isActive ? 'Activa' : 'Activar'}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Products by Category Sections */}
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
                                onChangeCategory={handleChangeCategory}
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

      {/* Product Image Manager Modal */}
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
