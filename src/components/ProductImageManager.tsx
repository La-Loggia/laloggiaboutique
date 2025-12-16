import { useRef, useState } from 'react';
import { useProductImages, useUploadImage, useAddProductImage, useDeleteProductImage, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Plus, ImagePlus, ChevronLeft } from 'lucide-react';

interface ProductImageManagerProps {
  product: Product;
  onClose: () => void;
}

const ProductImageManager = ({ product, onClose }: ProductImageManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: additionalImages = [], isLoading } = useProductImages(product.id);
  const uploadImage = useUploadImage();
  const addProductImage = useAddProductImage();
  const deleteProductImage = useDeleteProductImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      const nextOrder = additionalImages.length > 0 
        ? Math.max(...additionalImages.map(img => img.displayOrder)) + 1 
        : 1;
      
      await addProductImage.mutateAsync({
        productId: product.id,
        imageUrl,
        displayOrder: nextOrder,
      });
      
      toast.success('Imagen añadida');
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

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    
    try {
      await deleteProductImage.mutateAsync({ imageId, productId: product.id });
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg truncate">Imágenes Adicionales</h1>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Main Image */}
        <section>
          <h2 className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Imagen Principal
          </h2>
          <div className="aspect-[9/16] w-32 rounded-lg overflow-hidden bg-secondary">
            <img
              src={product.imageUrl}
              alt={product.brand}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Additional Images */}
        <section>
          <h2 className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Imágenes Adicionales ({additionalImages.length})
          </h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="grid grid-cols-3 gap-3">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-[9/16] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <span className="text-xs">Subiendo...</span>
              ) : (
                <>
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs">Añadir</span>
                </>
              )}
            </button>
            
            {/* Existing additional images */}
            {isLoading ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : (
              additionalImages.map((img) => (
                <div key={img.id} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-secondary group">
                  <img
                    src={img.imageUrl}
                    alt={`Adicional ${img.displayOrder}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar imagen"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                    #{img.displayOrder}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductImageManager;
