import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminContext } from '@/contexts/AdminContext';
import { useUploadImage, useCreateProduct, ProductCategory } from '@/hooks/useProducts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Brand, brands } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Upload, LogOut, X, Settings, ChevronDown } from 'lucide-react';

const categoryLabels: Record<ProductCategory, string> = {
  'ropa': 'Ropa',
  'bolsos': 'Bolsos',
};

const AdminToolbar = () => {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { isEditMode, setIsEditMode, isUploading, setIsUploading } = useAdminContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedBrand, setSelectedBrand] = useState<Brand>('MOOR');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ropa');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const uploadImage = useUploadImage();
  const createProduct = useCreateProduct();
  const { data: campaigns } = useCampaigns();

  if (!isAdmin) return null;

  // Collapsed state - mini floating circle button
  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-[150] w-12 h-12 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
        aria-label="Abrir herramientas de admin"
      >
        <Settings className="w-5 h-5" />
      </button>
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
      
      toast.success('Producto añadido correctamente');
      setShowUploadPanel(false);
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

  const handleLogout = async () => {
    await signOut();
    setIsEditMode(false);
    navigate('/');
  };

  return (
    <>
      {/* Fixed bottom toolbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2">
        {/* Main toolbar */}
        <div className="flex items-center gap-3 bg-foreground text-background px-4 py-2.5 rounded-full shadow-lg">
          {/* Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="text-background hover:text-background hover:bg-background/20 h-8 w-8"
            aria-label="Minimizar barra"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-5 bg-background/30" />
          
          {/* Edit mode toggle */}
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Editar</span>
            <Switch
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
              className="data-[state=checked]:bg-background/30"
            />
          </div>
          
          <div className="w-px h-5 bg-background/30" />
          
          {/* Upload button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            className="text-background hover:text-background hover:bg-background/20 gap-2 px-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Subir</span>
          </Button>
          
          <div className="w-px h-5 bg-background/30" />
          
          {/* Admin panel link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="text-background hover:text-background hover:bg-background/20 gap-2 px-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Panel</span>
          </Button>
          
          <div className="w-px h-5 bg-background/30" />
          
          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-background hover:text-background hover:bg-background/20 h-8 w-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Upload panel */}
      {showUploadPanel && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[150] bg-background border border-border rounded-xl shadow-xl p-4 w-[90vw] max-w-xs animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Subir nuevo producto</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUploadPanel(false)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v as Brand)}>
              <SelectTrigger>
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {(['ropa', 'bolsos'] as ProductCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Subiendo...' : 'Seleccionar imagen'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Overlay when upload panel is open */}
      {showUploadPanel && (
        <div 
          className="fixed inset-0 z-[140] bg-foreground/20"
          onClick={() => setShowUploadPanel(false)}
        />
      )}
    </>
  );
};

export default AdminToolbar;
