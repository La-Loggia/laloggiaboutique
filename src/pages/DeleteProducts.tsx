import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useActiveProducts, useSoftDeleteProducts, Product, ProductCategory } from '@/hooks/useProducts';
import { brandDisplayNames } from '@/lib/brandUtils';

const categoryLabels: Record<ProductCategory, string> = {
  ropa: 'Novedades',
  bolsos: 'Bolsos',
  plumiferos: 'Plumíferos',
  camisetas: 'Camisetas',
  jeans: 'Espacio Jeans',
};

const DeleteProducts = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useActiveProducts();
  const softDelete = useSoftDeleteProducts();

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState<Product | null>(null);

  const selectedCount = selected.length;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const deleteIds = async (ids: string[]) => {
    try {
      await softDelete.mutateAsync(ids);
      toast.success(
        ids.length === 1 ? 'Prenda eliminada (se guarda 30 días)' : `${ids.length} prendas eliminadas (se guardan 30 días)`
      );
      setConfirming(null);
      exitSelectMode();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar. Inténtalo de nuevo.');
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<ProductCategory, Product[]>();
    products.forEach((p) => {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    });
    return map;
  }, [products]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/subirprenda')} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-xl tracking-wide">LA LOGGIA</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Eliminar productos antiguos</p>
          </div>
          <Button
            variant={selectMode ? 'default' : 'outline'}
            size="sm"
            className="ml-auto"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          >
            {selectMode ? (
              <><X className="h-4 w-4 mr-1.5" /> Cancelar</>
            ) : (
              <><CheckSquare className="h-4 w-4 mr-1.5" /> Seleccionar varios</>
            )}
          </Button>
        </div>
      </header>

      <main className="px-3 py-5 max-w-6xl mx-auto space-y-8">
        <p className="text-sm text-muted-foreground text-center">
          Pulsa una prenda para eliminarla. Las prendas eliminadas se guardan 30 días por si hay que recuperarlas.
        </p>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Cargando prendas…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No hay prendas publicadas.</p>
        ) : (
          Array.from(grouped.entries()).map(([category, list]) => (
            <section key={category} className="space-y-3">
              <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground px-1">
                {categoryLabels[category]} · {list.length}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {list.map((product) => {
                  const isSelected = selected.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => (selectMode ? toggle(product.id) : setConfirming(product))}
                      className={`relative block w-full overflow-hidden rounded-lg border text-left transition-all ${
                        isSelected ? 'border-destructive ring-2 ring-destructive' : 'border-border'
                      }`}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.brand ? brandDisplayNames[product.brand] || product.brand : 'Prenda'}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[9/16] w-full object-cover"
                      />
                      {selectMode && (
                        <span
                          className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                            isSelected ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background/90 border-border'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </span>
                      )}
                      <span className="block px-2 py-1.5 text-[11px] text-muted-foreground truncate">
                        {product.brand ? brandDisplayNames[product.brand] || product.brand : 'Sin marca'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {selectMode && selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-4">
          <div className="max-w-md mx-auto">
            <Button
              variant="destructive"
              className="w-full h-12"
              disabled={softDelete.isPending}
              onClick={() => {
                if (confirm(`¿Eliminar ${selectedCount} prenda(s)? Se guardarán 30 días.`)) deleteIds(selected);
              }}
            >
              {softDelete.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Eliminando…</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Eliminar {selectedCount} seleccionada(s)</>
              )}
            </Button>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-5 space-y-4">
            <img
              src={confirming.imageUrl}
              alt=""
              className="mx-auto aspect-[9/16] w-32 object-cover rounded-lg"
            />
            <p className="text-center text-sm">
              ¿Eliminar esta prenda de la web? Se guardará 30 días por si hay que recuperarla.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={softDelete.isPending}
                onClick={() => deleteIds([confirming.id])}
              >
                {softDelete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteProducts;
