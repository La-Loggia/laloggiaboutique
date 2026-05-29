import { useEffect, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Copy, X } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import { toast } from 'sonner';

interface Props {
  urls: string[];
  startIndex?: number;
  open: boolean;
  onClose: () => void;
}

const SubmissionImageViewer = ({ urls, startIndex = 0, open, onClose }: Props) => {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      setIndex(startIndex);
      setScale(1);
      setShowCopyMenu(false);
    }
  }, [open, startIndex]);

  const current = urls[index];
  const fullUrl = current ? getOptimizedImageUrl(current, { width: 1800, quality: 90 }) : '';

  const prev = useCallback(() => {
    setScale(1);
    setIndex((i) => (i - 1 + urls.length) % urls.length);
  }, [urls.length]);

  const next = useCallback(() => {
    setScale(1);
    setIndex((i) => (i + 1) % urls.length);
  }, [urls.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, prev, next, onClose]);

  const copyImage = async () => {
    setShowCopyMenu(false);
    try {
      const res = await fetch(fullUrl, { mode: 'cors' });
      const blob = await res.blob();
      // Browser clipboard requires PNG. Convert via canvas.
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) throw new Error('No blob');
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob }),
          ]);
          toast.success('Imagen copiada');
        } catch {
          toast.error('No se pudo copiar (navegador no compatible)');
        }
      }, 'image/png');
    } catch {
      toast.error('Error al copiar la imagen');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double click/tap → toggle menu
      setShowCopyMenu((v) => !v);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setShowCopyMenu(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[100vw] w-screen h-screen sm:h-[95vh] sm:max-w-6xl p-0 bg-black/95 border-0 overflow-hidden [&>button]:hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
            <span className="text-xs text-white/80 font-medium">
              {index + 1} / {urls.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setScale((s) => Math.max(1, s - 0.5))}
                className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setScale((s) => Math.min(4, s + 0.5))}
                className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyImage}
                className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
                title="Copiar imagen"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center"
            onClick={() => setShowCopyMenu(false)}
          >
            <img
              src={fullUrl}
              alt={`Foto ${index + 1}`}
              onClick={handleImageClick}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCopyMenu(true);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowCopyMenu(true);
              }}
              style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
              className="max-h-full max-w-full object-contain cursor-zoom-in select-none"
              draggable={false}
            />

            {/* Copy menu overlay */}
            {showCopyMenu && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={copyImage}
                  className="flex items-center gap-2 bg-background text-foreground px-4 py-3 rounded-lg shadow-xl hover:bg-secondary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copiar imagen</span>
                </button>
              </div>
            )}
          </div>

          {/* Nav arrows */}
          {urls.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 text-white bg-black/40 hover:bg-black/60 hover:text-white rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 text-white bg-black/40 hover:bg-black/60 hover:text-white rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionImageViewer;
