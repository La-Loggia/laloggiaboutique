import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, X, Eye, ChevronRight } from 'lucide-react';
import { brands, Brand } from '@/data/products';
import { useUploadImage, useCreateProduct, ProductCategory } from '@/hooks/useProducts';

export interface VisibilityState {
  showInLatest: boolean;
  showInSection: boolean;
  showInBrand: boolean;
}

interface VisibilityPreset {
  label: string;
  description: string;
  state: VisibilityState;
}

export const visibilityPresets: VisibilityPreset[] = [
  { label: 'Toda la web', description: 'Novedades + Sección + Marca', state: { showInLatest: true, showInSection: true, showInBrand: true } },
  { label: 'Sección + Marca', description: 'Solo en su sección y marca', state: { showInLatest: false, showInSection: true, showInBrand: true } },
  { label: 'Sección + Novedades', description: 'Sin página de marca', state: { showInLatest: true, showInSection: true, showInBrand: false } },
  { label: 'Solo sección', description: 'Solo en su categoría', state: { showInLatest: false, showInSection: true, showInBrand: false } },
  { label: 'Solo marca', description: 'Solo en la página de marca', state: { showInLatest: false, showInSection: false, showInBrand: true } },
  { label: 'Solo novedades', description: 'Solo en novedades', state: { showInLatest: true, showInSection: false, showInBrand: false } },
];

export const getMatchingPreset = (state: VisibilityState): string | null => {
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

interface UploadProductDialogProps {
  open: boolean;
  onClose: () => void;
  initialBrand?: Brand | null;
  /** Called after the product is created successfully. */
  onPublished?: () => void | Promise<void>;
}

const UploadProductDialog = ({ open, onClose, initialBrand, onPublished }: UploadProductDialogProps) => {
  const [step, setStep] = useState<'section' | 'details'>('section');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand>(initialBrand || 'MOOR');
  const [visibility, setVisibility] = useState<VisibilityState>({ showInLatest: true, showInSection: true, showInBrand: true });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadImage();
  const createProduct = useCreateProduct();

  // Sync brand if parent changes initial brand while dialog is open
  useEffect(() => {
    if (open && initialBrand) setSelectedBrand(initialBrand);
  }, [open, initialBrand]);

  const resetState = () => {
    setStep('section');
    setSelectedCategory(null);
    setSelectedBrand(initialBrand || 'MOOR');
    setVisibility({ showInLatest: true, showInSection: true, showInBrand: true });
    setIsUploading(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleClose = () => {
    if (isUploading) return;
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
      if (onPublished) await onPublished();
      toast.success('Prenda añadida correctamente');
      resetState();
      onClose();
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

            {showBrand && (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marca</label>
                <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v as Brand)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                ¿Dónde se muestra?
              </label>

              <div className="grid grid-cols-2 gap-2">
                {visibilityPresets
                  .filter(p => showBrand || !p.state.showInBrand)
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

export default UploadProductDialog;
