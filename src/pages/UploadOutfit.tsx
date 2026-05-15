import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brands, Brand } from '@/data/products';
import { brandDisplayNames } from '@/lib/brandUtils';
import { Camera, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type Slot = 'top' | 'bottom';

const PhotoSlot = ({
  label,
  file,
  onPick,
  onClear,
}: {
  label: string;
  file: File | null;
  onPick: (f: File) => void;
  onClear: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium uppercase tracking-wider text-foreground">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
      {previewUrl ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary">
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 shadow-md"
            aria-label="Quitar foto"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs">
            <Check className="h-3 w-3" /> Lista
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/50"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm">Tocar para hacer foto</span>
          <span className="text-xs">o elegir de la galería</span>
        </button>
      )}
    </div>
  );
};

const UploadOutfit = () => {
  const [topFile, setTopFile] = useState<File | null>(null);
  const [bottomFile, setBottomFile] = useState<File | null>(null);
  const [brand, setBrand] = useState<Brand | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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

  const handleSubmit = async () => {
    if (!topFile || !bottomFile) {
      toast.error('Faltan fotos: parte de arriba y parte de abajo.');
      return;
    }
    if (!brand) {
      toast.error('Selecciona la marca principal.');
      return;
    }
    setSubmitting(true);
    try {
      const [topUrl, bottomUrl] = await Promise.all([
        uploadFile(topFile, 'top'),
        uploadFile(bottomFile, 'bottom'),
      ]);
      const { error } = await supabase.from('outfit_submissions').insert({
        top_image_url: topUrl,
        bottom_image_url: bottomUrl,
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
    setTopFile(null);
    setBottomFile(null);
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
            <p className="text-muted-foreground text-sm">
              Carlos ya puede ver el outfit.
            </p>
          </div>
          <Button onClick={reset} className="w-full">Subir otro outfit</Button>
        </div>
      </div>
    );
  }

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
          label="Parte de arriba"
          file={topFile}
          onPick={setTopFile}
          onClear={() => setTopFile(null)}
        />
        <PhotoSlot
          label="Parte de abajo"
          file={bottomFile}
          onPick={setBottomFile}
          onClear={() => setBottomFile(null)}
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
            disabled={submitting || !topFile || !bottomFile || !brand}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…
              </>
            ) : (
              'Enviar outfit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadOutfit;
