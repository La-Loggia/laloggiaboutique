import { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Check, Trash2, ExternalLink, Upload, Plus, X, Loader2, Send } from 'lucide-react';
import { brandDisplayNames } from '@/lib/brandUtils';
import { brands, Brand } from '@/data/products';
import {
  useCreateProduct,
  useUploadImage,
  useAddProductImage,
  ProductCategory,
} from '@/hooks/useProducts';
import { toast } from 'sonner';

interface Submission {
  id: string;
  top_image_url: string | null;
  bottom_image_url: string | null;
  top_image_urls: string[] | null;
  bottom_image_urls: string[] | null;
  full_outfit_image_urls: string[] | null;
  source_url: string | null;
  brand: Brand | null;
  notes: string | null;
  reviewed: boolean;
  created_at: string;
}

const collectUrls = (arr: string[] | null, legacy: string | null): string[] => {
  const list = Array.isArray(arr) ? [...arr] : [];
  if (legacy && !list.includes(legacy)) list.unshift(legacy);
  return list;
};

const collectAllSubmissionUrls = (item: Submission): string[] => [
  ...collectUrls(item.top_image_urls, item.top_image_url),
  ...collectUrls(item.bottom_image_urls, item.bottom_image_url),
  ...collectUrls(item.full_outfit_image_urls, null),
];

// Extract storage path inside outfit-submissions bucket from a public URL
const extractSubmissionStoragePath = (url: string): string | null => {
  const marker = '/outfit-submissions/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
};

const categoryOptions: { value: ProductCategory; label: string }[] = [
  { value: 'ropa', label: 'Novedades (Ropa)' },
  { value: 'bolsos', label: 'Bolsos' },
  { value: 'plumiferos', label: 'Plumíferos' },
  { value: 'camisetas', label: 'Camisetas' },
  { value: 'jeans', label: 'Espacio Jeans' },
];

const AdminSubmissions = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loadingItems, setLoadingItems] = useState(true);

  // Publish dialog state
  const [publishing, setPublishing] = useState<Submission | null>(null);
  const [pubBrand, setPubBrand] = useState<Brand | ''>('');
  const [pubCategory, setPubCategory] = useState<ProductCategory>('ropa');
  const [pubMain, setPubMain] = useState<File | null>(null);
  const [pubExtras, setPubExtras] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const mainRef = useRef<HTMLInputElement>(null);
  const extrasRef = useRef<HTMLInputElement>(null);

  const createProduct = useCreateProduct();
  const uploadImage = useUploadImage();
  const addProductImage = useAddProductImage();

  const load = async () => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('outfit_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error al cargar subidas');
    } else {
      setItems((data as Submission[]) || []);
    }
    setLoadingItems(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando…</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const toggleReviewed = async (item: Submission) => {
    const { error } = await supabase
      .from('outfit_submissions')
      .update({ reviewed: !item.reviewed })
      .eq('id', item.id);
    if (error) return toast.error('Error');
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, reviewed: !i.reviewed } : i)));
  };

  const cleanupSubmission = async (item: Submission) => {
    const urls = collectAllSubmissionUrls(item);
    const paths = urls
      .map(extractSubmissionStoragePath)
      .filter((p): p is string => !!p);
    if (paths.length > 0) {
      await supabase.storage.from('outfit-submissions').remove(paths);
    }
    await supabase.from('outfit_submissions').delete().eq('id', item.id);
  };

  const remove = async (item: Submission) => {
    if (!confirm('¿Eliminar esta subida y sus fotos?')) return;
    try {
      await cleanupSubmission(item);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success('Eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const openPublish = (item: Submission) => {
    setPublishing(item);
    setPubBrand(item.brand ?? '');
    setPubCategory('ropa');
    setPubMain(null);
    setPubExtras([]);
  };

  const closePublish = () => {
    if (submitting) return;
    setPublishing(null);
    setPubMain(null);
    setPubExtras([]);
  };

  const handlePublish = async () => {
    if (!publishing) return;
    if (!pubMain) return toast.error('Añade la foto principal.');
    if (!pubBrand) return toast.error('Selecciona la marca.');
    setSubmitting(true);
    try {
      const mainUrl = await uploadImage.mutateAsync(pubMain);
      const product = await createProduct.mutateAsync({
        brand: pubBrand,
        imageUrl: mainUrl,
        category: pubCategory,
        showInLatest: true,
        showInSection: true,
        showInBrand: true,
      });
      // Upload extras sequentially to keep display_order stable
      for (let i = 0; i < pubExtras.length; i++) {
        const url = await uploadImage.mutateAsync(pubExtras[i]);
        await addProductImage.mutateAsync({
          productId: product.id,
          imageUrl: url,
          displayOrder: i,
        });
      }
      // Cleanup the original submission + its storage files
      await cleanupSubmission(publishing);
      setItems((prev) => prev.filter((i) => i.id !== publishing.id));
      toast.success('Producto publicado');
      setPublishing(null);
      setPubMain(null);
      setPubExtras([]);
    } catch (err) {
      console.error(err);
      toast.error('Error al publicar');
    } finally {
      setSubmitting(false);
    }
  };

  const visible = items.filter((i) => (filter === 'pending' ? !i.reviewed : true));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-xl tracking-wide">Outfits subidos</h1>
              <p className="text-xs text-muted-foreground">{visible.length} {filter === 'pending' ? 'pendientes' : 'en total'}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant={filter === 'pending' ? 'default' : 'ghost'} onClick={() => setFilter('pending')}>
              Pendientes
            </Button>
            <Button size="sm" variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')}>
              Todos
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-3xl mx-auto">
        {loadingItems ? (
          <p className="text-center text-muted-foreground py-8">Cargando…</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay outfits {filter === 'pending' ? 'pendientes' : ''}.</p>
        ) : (
          visible.map((item) => (
            <article key={item.id} className="bg-secondary/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(item.created_at).toLocaleString('es-ES')}</span>
                {item.reviewed && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" /> Revisado
                  </span>
                )}
              </div>

              {(() => {
                const groups: { label: string; urls: string[] }[] = [
                  { label: 'Arriba', urls: collectUrls(item.top_image_urls, item.top_image_url) },
                  { label: 'Abajo', urls: collectUrls(item.bottom_image_urls, item.bottom_image_url) },
                  { label: 'Outfit', urls: collectUrls(item.full_outfit_image_urls, null) },
                ].filter((g) => g.urls.length > 0);

                return groups.map((g) => (
                  <div key={g.label} className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{g.label} ({g.urls.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.urls.map((url, idx) => (
                        <a
                          key={`${g.label}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block aspect-[3/4] overflow-hidden rounded-md bg-background"
                        >
                          <img src={url} alt={`${g.label} ${idx + 1}`} className="h-full w-full object-cover" />
                          <ExternalLink className="absolute top-1 right-1 w-3.5 h-3.5 text-background mix-blend-difference" />
                        </a>
                      ))}
                    </div>
                  </div>
                ));
              })()}

              <div className="space-y-1 text-sm">
                {item.source_url && (
                  <p className="bg-background/50 rounded p-2 text-sm break-all">
                    <span className="text-muted-foreground">Enlace: </span>
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="underline">{item.source_url}</a>
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Marca:</span>{' '}
                  <span className="font-medium">{item.brand ? brandDisplayNames[item.brand] || item.brand : '—'}</span>
                </p>
                {item.notes && (
                  <p className="bg-background/50 rounded p-2 text-sm whitespace-pre-wrap">{item.notes}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" onClick={() => openPublish(item)} className="flex-1 min-w-[140px]">
                  <Send className="w-4 h-4 mr-1" /> Publicar producto
                </Button>
                <Button
                  size="sm"
                  variant={item.reviewed ? 'outline' : 'secondary'}
                  onClick={() => toggleReviewed(item)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {item.reviewed ? 'Pendiente' : 'Revisado'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(item)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Publish dialog */}
      <Dialog open={!!publishing} onOpenChange={(o) => !o && closePublish()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publicar producto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Marca</label>
              <Select value={pubBrand} onValueChange={(v) => setPubBrand(v as Brand)}>
                <SelectTrigger><SelectValue placeholder="Selecciona marca" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{brandDisplayNames[b] || b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Sección</label>
              <Select value={pubCategory} onValueChange={(v) => setPubCategory(v as ProductCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Foto principal</label>
              <input
                ref={mainRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  setPubMain(e.target.files?.[0] ?? null);
                  e.target.value = '';
                }}
              />
              {pubMain ? (
                <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-md bg-secondary">
                  <img src={URL.createObjectURL(pubMain)} alt="principal" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPubMain(null)}
                    className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainRef.current?.click()}
                  className="flex aspect-[3/4] w-32 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Subir</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Fotos adicionales <span className="normal-case">(opcional)</span>
              </label>
              <input
                ref={extrasRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setPubExtras((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                  e.target.value = '';
                }}
              />
              <div className="grid grid-cols-4 gap-2">
                {pubExtras.map((f, idx) => (
                  <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
                    <img src={URL.createObjectURL(f)} alt={`extra ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPubExtras((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => extrasRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Añadir</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-secondary/50 rounded p-2">
              Al publicar se eliminarán las fotos originales que subieron los dueños para liberar espacio.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closePublish} disabled={submitting}>Cancelar</Button>
            <Button onClick={handlePublish} disabled={submitting || !pubMain || !pubBrand}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publicando…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Publicar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;
