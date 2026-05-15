import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brands, Brand } from '@/data/products';
import { brandDisplayNames } from '@/lib/brandUtils';
import { Camera, Check, Loader2, X, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Slot = 'top' | 'bottom' | 'full';

const SLOT_LABELS: Record<Slot, string> = {
  top: 'Parte de arriba',
  bottom: 'Parte de abajo',
  full: 'Outfit completo',
};

const PhotoSlot = ({
  slot,
  files,
  onAdd,
  onRemove,
}: {
  slot: Slot;
  files: File[];
  onAdd: (f: File) => void;
  onRemove: (idx: number) => void;
}) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => onAdd(f));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium uppercase tracking-wider text-foreground">
        {SLOT_LABELS[slot]}
        <span className="ml-2 normal-case text-xs text-muted-foreground">(opcional)</span>
      </label>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {files.length === 0 ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm">Tocar para añadir foto</span>
          <span className="text-xs">Cámara o galería</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary"
              >
                <img src={url} alt={`${SLOT_LABELS[slot]} ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-background/90 p-1.5 shadow-md"
                  aria-label="Quitar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">Añadir más</span>
          </button>
        </div>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center text-base">Añadir foto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <Button
              variant="outline"
              className="h-14 justify-start"
              onClick={() => {
                setPickerOpen(false);
                cameraRef.current?.click();
              }}
            >
              <Camera className="h-5 w-5 mr-3" /> Hacer foto
            </Button>
            <Button
              variant="outline"
              className="h-14 justify-start"
              onClick={() => {
                setPickerOpen(false);
                galleryRef.current?.click();
              }}
            >
              <ImageIcon className="h-5 w-5 mr-3" /> Elegir de la galería
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UploadOutfit = () => {
  const [topFiles, setTopFiles] = useState<File[]>([]);
  const [bottomFiles, setBottomFiles] = useState<File[]>([]);
  const [fullFiles, setFullFiles] = useState<File[]>([]);
  const [brand, setBrand] = useState<Brand | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const totalPhotos = topFiles.length + bottomFiles.length + fullFiles.length;

  const uploadFile = async (file: File, slot: Slot): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${slot}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('outfit-submissions')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('outfit-submissions').getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadAll = async (files: File[], slot: Slot) =>
    Promise.all(files.map((f) => uploadFile(f, slot)));

  const handleSubmit = async () => {
    if (totalPhotos === 0) {
      toast.error('Añade al menos una foto.');
      return;
    }
    if (!brand) {
      toast.error('Selecciona la marca principal.');
      return;
    }
    setSubmitting(true);
    try {
      const [topUrls, bottomUrls, fullUrls] = await Promise.all([
        uploadAll(topFiles, 'top'),
        uploadAll(bottomFiles, 'bottom'),
        uploadAll(fullFiles, 'full'),
      ]);
      const { error } = await supabase.from('outfit_submissions').insert({
        top_image_urls: topUrls,
        bottom_image_urls: bottomUrls,
        full_outfit_image_urls: fullUrls,
        // legacy compat: keep first photo in old single fields when present
        top_image_url: topUrls[0] ?? null,
        bottom_image_url: bottomUrls[0] ?? fullUrls[0] ?? topUrls[0] ?? '',
        brand,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setTopFiles([]);
    setBottomFiles([]);
    setFullFiles([]);
    setBrand('');
    setNotes('');
    setDone(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl mb-2">¡Enviado!</h1>
            <p className="text-muted-foreground text-sm">Carlos ya puede ver el outfit.</p>
          </div>
          <Button onClick={reset} className="w-full">Subir otro outfit</Button>
        </div>
      </div>
    );
  }

  const addTo = (setter: React.Dispatch<React.SetStateAction<File[]>>) => (f: File) =>
    setter((prev) => [...prev, f]);
  const removeFrom = (setter: React.Dispatch<React.SetStateAction<File[]>>) => (idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="px-4 py-4">
          <h1 className="font-serif text-xl tracking-wide">LA LOGGIA</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Subir outfit</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto pb-32">
        <PhotoSlot
          slot="top"
          files={topFiles}
          onAdd={addTo(setTopFiles)}
          onRemove={removeFrom(setTopFiles)}
        />
        <PhotoSlot
          slot="bottom"
          files={bottomFiles}
          onAdd={addTo(setBottomFiles)}
          onRemove={removeFrom(setBottomFiles)}
        />
        <PhotoSlot
          slot="full"
          files={fullFiles}
          onAdd={addTo(setFullFiles)}
          onRemove={removeFrom(setFullFiles)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium uppercase tracking-wider">
            Marca principal
          </label>
          <Select value={brand} onValueChange={(v) => setBrand(v as Brand)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {brandDisplayNames[b] || b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium uppercase tracking-wider">
            Notas para Carlos <span className="text-muted-foreground normal-case text-xs">(opcional)</span>
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aclaraciones, talla, color, urgencia…"
            rows={4}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting || totalPhotos === 0 || !brand}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…
              </>
            ) : (
              `Enviar outfit${totalPhotos ? ` (${totalPhotos} foto${totalPhotos > 1 ? 's' : ''})` : ''}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadOutfit;
