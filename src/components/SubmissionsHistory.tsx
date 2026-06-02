import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Link2, Check, Clock } from 'lucide-react';
import { brandDisplayNames } from '@/lib/brandUtils';

interface Submission {
  id: string;
  created_at: string;
  brand: string | null;
  source_url: string | null;
  notes: string | null;
  reviewed: boolean;
  top_image_urls: string[];
  bottom_image_urls: string[];
  full_outfit_image_urls: string[];
  top_image_url: string | null;
  bottom_image_url: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 60;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCover = (s: Submission): string | null => {
  return (
    s.full_outfit_image_urls?.[0] ||
    s.top_image_urls?.[0] ||
    s.bottom_image_urls?.[0] ||
    s.top_image_url ||
    s.bottom_image_url ||
    null
  );
};

const SubmissionsHistory = ({ open, onClose }: Props) => {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!open) return;
    setItems([]);
    setPage(0);
    setHasMore(true);
    void loadPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadPage = async (p: number, reset = false) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('outfit_submissions')
      .select('id, created_at, brand, source_url, notes, reviewed, top_image_urls, bottom_image_urls, full_outfit_image_urls, top_image_url, bottom_image_url')
      .order('created_at', { ascending: false })
      .range(from, to);
    setLoading(false);
    if (error) return;
    const rows = (data ?? []) as Submission[];
    setItems((prev) => (reset ? rows : [...prev, ...rows]));
    setHasMore(rows.length === PAGE_SIZE);
    setPage(p);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-wide">Historial de subidas</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Todas las prendas enviadas — para no repetir envíos.
          </p>
        </DialogHeader>

        {items.length === 0 && loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Aún no hay subidas.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {items.map((s) => {
                const cover = getCover(s);
                const totalPhotos =
                  (s.top_image_urls?.length || 0) +
                  (s.bottom_image_urls?.length || 0) +
                  (s.full_outfit_image_urls?.length || 0);
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                      {cover ? (
                        <img src={cover} alt={s.brand ?? 'subida'} className="h-full w-full object-cover" loading="lazy" />
                      ) : s.source_url ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <Link2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : null}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                        {s.reviewed ? (
                          <><Check className="h-2.5 w-2.5" /> Preparada</>
                        ) : (
                          <><Clock className="h-2.5 w-2.5" /> Pendiente</>
                        )}
                      </div>
                      {totalPhotos > 1 && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                          {totalPhotos} fotos
                        </div>
                      )}
                    </div>
                    <div className="px-0.5">
                      <p className="text-xs font-medium truncate">
                        {s.brand ? (brandDisplayNames[s.brand] ?? s.brand) : 'Sin marca'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(s.created_at)}</p>
                      {s.source_url && (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          <Link2 className="h-2.5 w-2.5" /> enlace
                        </a>
                      )}
                      {s.notes && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">{s.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => loadPage(page + 1)}
                disabled={loading}
                className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando…' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionsHistory;
