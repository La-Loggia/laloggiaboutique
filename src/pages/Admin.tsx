import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImage, Product } from '@/hooks/useProducts';
import { useCampaigns, useCreateCampaign, useSetActiveCampaign } from '@/hooks/useCampaigns';
import { brands, Brand } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { LogOut, Upload, Trash2, Plus, Images, Pencil, GripVertical } from 'lucide-react';
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
}

const SortableProduct = ({ product, onToggleActive, onDelete, onManageImages, onReplaceImage }: SortableProductProps) => {
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
      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.brand}
          className="w-16 h-20 object-cover rounded"
        />
        <button
          onClick={() => onReplaceImage(product)}
          className="absolute -top-1 -right-1 p-1 bg-foreground text-background rounded-full hover:bg-foreground/80"
          title="Reemplazar imagen"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{product.brand}</p>
        <p className="text-xs text-muted-foreground">
          {product.createdAt.toLocaleDateString('es-ES')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
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
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
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
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);
  const [replacingProduct, setReplacingProduct] = useState<Product | null>(null);
  const [productOrder, setProductOrder] = useState<string[]>([]);
  
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: campaigns } = useCampaigns();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadImage();
  const createCampaign = useCreateCampaign();
  const setActiveCampaign = useSetActiveCampaign();

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

  // Initialize product order from products
  const orderedProducts = products ? 
    (productOrder.length > 0 
      ? productOrder.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
      : products)
    : [];

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentProducts = orderedProducts;
      const oldIndex = currentProducts.findIndex((p) => p.id === active.id);
      const newIndex = currentProducts.findIndex((p) => p.id === over.id);
      
      const newOrder = arrayMove(currentProducts, oldIndex, newIndex);
      setProductOrder(newOrder.map(p => p.id));
      toast.success('Orden actualizado (solo visual en esta sesión)');
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

        {/* Products List */}
        <section>
          <h2 className="font-sans text-sm font-medium uppercase tracking-wider mb-2">
            Prendas ({products?.length || 0})
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Arrastra las 3 rayitas para reordenar • Toca el lápiz para reemplazar imagen
          </p>
          
          {productsLoading ? (
            <p className="text-muted-foreground text-center py-8">Cargando...</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedProducts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {orderedProducts.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      onManageImages={setManagingProduct}
                      onReplaceImage={handleReplaceImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
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
