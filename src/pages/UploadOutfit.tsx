import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brands, Brand } from '@/data/products';
import { brandDisplayNames } from '@/lib/brandUtils';
import { Camera, Check, Loader2, X, Plus, Image as ImageIcon, Link2, Shirt, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Slot = 'top' | 'bottom' | 'full';
type Mode = null | 'outfit' | 'link';

const SLOT_LABELS: Record<Slot, string> = {
  top: 'Parte de arriba',
  bottom: 'Parte de abajo',
  full: 'Outfit completo',
};

// Memoized preview that keeps the same blob URL across re-renders
const FilePreview = ({ file, onRemove, alt }: { file: File; onRemove: () => void; alt: string }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
      <img src={url} alt={alt} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 rounded-full bg-background/90 p-1.5 shadow-md"
        aria-label="Quitar foto"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const PhotoSlot = ({
  slot,
  files,
  onAdd,
  onRemove,
  allowCamera = true,
  label,
}: {
  slot: Slot;
  files: File[];
  onAdd: (f: File) => void;
  onRemove: (idx: number) => void;
  allowCamera?: boolean;
  label?: string;
}) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => onAdd(f));
  };

  const openPicker = () => {
    if (allowCamera) setPickerOpen(true);
    else galleryRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium uppercase tracking-wider text-foreground">
        {label ?? SLOT_LABELS[slot]}
        <span className="ml-2 normal-case text-xs text-muted-foreground">(opcional)</span>
      </label>

      {allowCamera && (
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
      )}
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
          onClick={openPicker}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50"
        >
          {allowCamera ? <Camera className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
          <span className="text-sm">Tocar para añadir foto</span>
          <span className="text-xs">{allowCamera ? 'Cámara o galería' : 'Desde galería'}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {files.map((file, idx) => (
            <FilePreview
              key={`${file.name}-${file.lastModified}-${file.size}-${idx}`}
              file={file}
              alt={`foto ${idx + 1}`}
              onRemove={() => onRemove(idx)}
            />
          ))}
          <button
            type="button"
            onClick={openPicker}
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

// Convert any browser-decodable image (HEIC en iOS Safari, JPG, PNG…) to a compressed JPEG.
// If the browser can't decode it (e.g. HEIC en Chrome desktop), we upload the original.
const processImage = async (file: File): Promise<{ blob: Blob; ext: string; contentType: string }> => {
  const maxDim = 2000;
  const quality = 0.85;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob'))),
        'image/jpeg',
        quality,
      );
    });
    return { blob, ext: 'jpg', contentType: 'image/jpeg' };
  } catch {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    return { blob: file, ext, contentType: file.type || 'application/octet-stream' };
  }
};

const UploadOutfit = () => {
  const [mode, setMode] = useState<Mode>(null);
  const [topFiles, setTopFiles] = useState<File[]>([]);
  const [bottomFiles, setBottomFiles] = useState<File[]>([]);
  const [fullFiles, setFullFiles] = useState<File[]>([]);
  const [linkFiles, setLinkFiles] = useState<File[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [brand, setBrand] = useState<Brand | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const totalOutfitPhotos = topFiles.length + bottomFiles.length + fullFiles.length;

  const uploadFile = async (file: File, slot: string, index: number): Promise<string> => {
    const { blob, ext, contentType } = await processImage(file);
    const path = `${Date.now()}-${slot}-${index}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
      .from('outfit-submissions')
      .upload(path, blob, { contentType, upsert: false });
    if (error) throw new Error(`${slot}: ${error.message}`);
    const { data } = supabase.storage.from('outfit-submissions').getPublicUrl(path);
    return data.publicUrl;
  };

  // Sequential to avoid mobile network overload and clearer error reporting
  const uploadAll = async (files: File[], slot: string) => {
    const out: string[] = [];
    for (let i = 0; i < files.length; i++) {
      out.push(await uploadFile(files[i], slot, i));
    }
    return out;
  };

  const reset = () => {
    setMode(null);
    setTopFiles([]);
    setBottomFiles([]);
    setFullFiles([]);
    setLinkFiles([]);
    setSourceUrl('');
    setBrand('');
    setNotes('');
    setDone(false);
  };

  const handleSubmitOutfit = async () => {
    if (totalOutfitPhotos === 0) return toast.error('Añade al menos una foto.');
    if (!brand) return toast.error('Selecciona la marca principal.');
    setSubmitting(true);
    try {
      const topUrls = await uploadAll(topFiles, 'top');
      const bottomUrls = await uploadAll(bottomFiles, 'bottom');
      const fullUrls = await uploadAll(fullFiles, 'full');
      const { error } = await supabase.from('outfit_submissions').insert({
        top_image_urls: topUrls,
        bottom_image_urls: bottomUrls,
        full_outfit_image_urls: fullUrls,
        top_image_url: topUrls[0] ?? null,
        bottom_image_url: bottomUrls[0] ?? fullUrls[0] ?? topUrls[0] ?? '',
        brand,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ? `Error: ${err.message}` : 'Error al enviar. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLink = async () => {
    const url = sourceUrl.trim();
    if (!url) return toast.error('Pega un enlace.');
    try {
      new URL(url);
    } catch {
      return toast.error('El enlace no es válido.');
    }
    if (!brand) return toast.error('Selecciona la marca.');
    setSubmitting(true);
    try {
      const fullUrls = await uploadAll(linkFiles, 'link');
      const { error } = await supabase.from('outfit_submissions').insert({
        source_url: url,
        full_outfit_image_urls: fullUrls,
        top_image_urls: [],
        bottom_image_urls: [],
        bottom_image_url: fullUrls[0] ?? '',
        brand,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ? `Error: ${err.message}` : 'Error al enviar. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
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
            <p className="text-muted-foreground text-sm">Carlos ya puede verlo.</p>
          </div>
          <Button onClick={reset} className="w-full">Subir otro</Button>
        </div>
      </div>
    );
  }

  const addTo = (setter: React.Dispatch<React.SetStateAction<File[]>>) => (f: File) =>
    setter((prev) => [...prev, f]);
  const removeFrom = (setter: React.Dispatch<React.SetStateAction<File[]>>) => (idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  // Mode picker
  if (mode === null) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="px-4 py-4">
            <h1 className="font-serif text-xl tracking-wide">LA LOGGIA</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">¿Qué quieres enviar?</p>
          </div>
        </header>
        <main className="p-6 max-w-md mx-auto space-y-4 pt-10">
          <button
            type="button"
            onClick={() => setMode('outfit')}
            className="w-full rounded-xl border-2 border-border bg-secondary/30 p-6 text-left transition-colors hover:bg-secondary/60"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
                <Shirt className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-lg">Subir outfit</p>
                <p className="text-sm text-muted-foreground">Fotos de prendas en percha (arriba, abajo, conjunto)</p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className="w-full rounded-xl border-2 border-border bg-secondary/30 p-6 text-left transition-colors hover:bg-secondary/60"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-lg">Subir link de otra web</p>
                <p className="text-sm text-muted-foreground">Pega un enlace (bolso, conjunto…) y opcionalmente añade fotos</p>
              </div>
            </div>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-xl tracking-wide">LA LOGGIA</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {mode === 'outfit' ? 'Subir outfit' : 'Subir link'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto pb-32">
        {mode === 'outfit' ? (
          <>
            <PhotoSlot slot="top" files={topFiles} onAdd={addTo(setTopFiles)} onRemove={removeFrom(setTopFiles)} />
            <PhotoSlot slot="bottom" files={bottomFiles} onAdd={addTo(setBottomFiles)} onRemove={removeFrom(setBottomFiles)} />
            <PhotoSlot slot="full" files={fullFiles} onAdd={addTo(setFullFiles)} onRemove={removeFrom(setFullFiles)} />
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium uppercase tracking-wider">Enlace</label>
              <Input
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="h-12"
              />
            </div>
            <PhotoSlot
              slot="full"
              label="Fotos adicionales"
              files={linkFiles}
              onAdd={addTo(setLinkFiles)}
              onRemove={removeFrom(setLinkFiles)}
              allowCamera={false}
            />
          </>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium uppercase tracking-wider">Marca principal</label>
          <Select value={brand} onValueChange={(v) => setBrand(v as Brand)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{brandDisplayNames[b] || b}</SelectItem>
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
            onClick={mode === 'outfit' ? handleSubmitOutfit : handleSubmitLink}
            disabled={
              submitting ||
              !brand ||
              (mode === 'outfit' ? totalOutfitPhotos === 0 : !sourceUrl.trim())
            }
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
            ) : (
              mode === 'outfit'
                ? `Enviar outfit${totalOutfitPhotos ? ` (${totalOutfitPhotos} foto${totalOutfitPhotos > 1 ? 's' : ''})` : ''}`
                : 'Enviar link'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadOutfit;
