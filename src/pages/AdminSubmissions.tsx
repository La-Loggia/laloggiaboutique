import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check, Trash2, Send, Image as ImageIcon } from 'lucide-react';
import { brandDisplayNames } from '@/lib/brandUtils';
import { Brand } from '@/data/products';
import UploadProductDialog from '@/components/UploadProductDialog';
import SubmissionImageViewer from '@/components/SubmissionImageViewer';
import { toast } from 'sonner';
import { getThumbnailUrl } from '@/lib/imageOptimization';

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

const extractSubmissionStoragePath = (url: string): string | null => {
  const marker = '/outfit-submissions/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
};

const AdminSubmissions = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loadingItems, setLoadingItems] = useState(true);
  const [publishing, setPublishing] = useState<Submission | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [viewer, setViewer] = useState<{ urls: string[]; startIndex: number } | null>(null);

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
      if (detail?.id === item.id) setDetail(null);
      toast.success('Eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handlePublished = async () => {
    if (!publishing) return;
    try {
      await cleanupSubmission(publishing);
      setItems((prev) => prev.filter((i) => i.id !== publishing.id));
      if (detail?.id === publishing.id) setDetail(null);
    } catch (err) {
      console.error('No se pudieron limpiar las fotos originales', err);
    }
  };

  const visible = items.filter((i) => (filter === 'pending' ? !i.reviewed : true));

  const allGroups = (item: Submission) => [
    { label: 'Arriba', urls: collectUrls(item.top_image_urls, item.top_image_url) },
    { label: 'Abajo', urls: collectUrls(item.bottom_image_urls, item.bottom_image_url) },
    { label: 'Outfit', urls: collectUrls(item.full_outfit_image_urls, null) },
  ].filter((g) => g.urls.length > 0);

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

      <main className="p-4 max-w-[1600px] mx-auto">
        {loadingItems ? (
          <p className="text-center text-muted-foreground py-8">Cargando…</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay outfits {filter === 'pending' ? 'pendientes' : ''}.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {visible.map((item) => {
              const groups = allGroups(item);
              const allUrls = groups.flatMap((g) => g.urls);
              const cover = allUrls[0];
              const totalImages = allUrls.length;

              return (
                <Card
                  key={item.id}
                  onClick={() => setDetail(item)}
                  className="group cursor-pointer overflow-hidden border-0 rounded-lg shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[3/4] bg-muted">
                    {cover ? (
                      <img
                        src={getThumbnailUrl(cover, 500)}
                        alt={item.brand ? brandDisplayNames[item.brand] || item.brand : 'Outfit'}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    {/* Status pill */}
                    <div className="absolute top-2 left-2">
                      {item.reviewed ? (
                        <span className="flex items-center gap-1 text-[10px] text-white bg-green-600/90 backdrop-blur px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Revisado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-white bg-amber-500/90 backdrop-blur px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" /> Pendiente
                        </span>
                      )}
                    </div>

                    {/* Photo count */}
                    {totalImages > 1 && (
                      <span className="absolute top-2 right-2 text-[10px] text-white bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
                        {totalImages} fotos
                      </span>
                    )}

                    {/* Brand label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs font-medium text-white truncate">
                        {item.brand ? brandDisplayNames[item.brand] || item.brand : 'Sin marca'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-wide">
              {detail?.brand ? brandDisplayNames[detail.brand] || detail.brand : 'Outfit subido'}
            </DialogTitle>
          </DialogHeader>
          {detail && (() => {
            const groups = allGroups(detail);
            const allUrls = groups.flatMap((g) => g.urls);
            let runningIdx = 0;
            return (
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(detail.created_at).toLocaleString('es-ES')}</span>
                  {detail.reviewed ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" /> Revisado
                    </span>
                  ) : (
                    <span className="text-amber-600">Pendiente</span>
                  )}
                </div>

                {groups.map((g) => (
                  <div key={g.label} className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                      {g.label} · {g.urls.length}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {g.urls.map((url) => {
                        const idx = runningIdx++;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setViewer({ urls: allUrls, startIndex: idx })}
                            className="relative block aspect-[3/4] overflow-hidden rounded-md bg-muted group"
                          >
                            <img
                              src={getThumbnailUrl(url, 500)}
                              alt={`${g.label} ${idx + 1}`}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {detail.source_url && (
                  <a
                    href={detail.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs underline text-muted-foreground hover:text-foreground"
                    title={detail.source_url}
                  >
                    {detail.source_url}
                  </a>
                )}

                {detail.notes && (
                  <p className="text-xs bg-muted/50 rounded p-2 whitespace-pre-wrap">{detail.notes}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button size="sm" onClick={() => setPublishing(detail)} className="flex-1 min-w-[120px]">
                    <Send className="w-3.5 h-3.5 mr-1" /> Publicar
                  </Button>
                  <Button
                    size="sm"
                    variant={detail.reviewed ? 'outline' : 'secondary'}
                    onClick={() => toggleReviewed(detail)}
                    className="flex-1"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {detail.reviewed ? 'Marcar pendiente' : 'Revisado'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(detail)} className="shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <UploadProductDialog
        open={!!publishing}
        onClose={() => setPublishing(null)}
        initialBrand={publishing?.brand ?? null}
        onPublished={handlePublished}
      />

      <SubmissionImageViewer
        open={!!viewer}
        urls={viewer?.urls ?? []}
        startIndex={viewer?.startIndex ?? 0}
        onClose={() => setViewer(null)}
      />
    </div>
  );
};

export default AdminSubmissions;
