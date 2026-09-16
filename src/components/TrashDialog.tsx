import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeletedProducts, useRestoreProducts, useDeleteProduct } from '@/hooks/useProducts';
import { brandDisplayNames } from '@/lib/brandUtils';

interface TrashDialogProps {
  open: boolean;
  onClose: () => void;
}

const daysLeft = (deletedAt: Date) => {
  const ms = deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
};

const TrashDialog = ({ open, onClose }: TrashDialogProps) => {
  const { data: products = [], isLoading } = useDeletedProducts();
  const restore = useRestoreProducts();
  const deleteProduct = useDeleteProduct();

  const handleRestore = async (id: string) => {
    try {
      await restore.mutateAsync([id]);
      toast.success('Prenda recuperada');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo recuperar la prenda');
    }
  };

  const handlePurge = async (id: string) => {
    if (!confirm('¿Eliminar definitivamente esta prenda? No se podrá recuperar.')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Prenda eliminada definitivamente');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Papelera · 30 días</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Prendas eliminadas por los dueños. Se borran solas a los 30 días; hasta entonces puedes recuperarlas.
        </p>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">La papelera está vacía.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border border-border overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.brand ? brandDisplayNames[product.brand] || product.brand : 'Prenda'}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[9/16] w-full object-cover"
                />
                <div className="p-2 space-y-2">
                  <p className="text-[11px] text-muted-foreground truncate">
                    {product.brand ? brandDisplayNames[product.brand] || product.brand : 'Sin marca'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Quedan {daysLeft(product.deletedAt)} días
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-[11px]"
                      disabled={restore.isPending}
                      onClick={() => handleRestore(product.id)}
                    >
                      {restore.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><RotateCcw className="h-3 w-3 mr-1" /> Recuperar</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive"
                      onClick={() => handlePurge(product.id)}
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrashDialog;
