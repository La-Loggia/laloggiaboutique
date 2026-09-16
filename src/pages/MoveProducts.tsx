import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Move, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProductScopePicker from '@/components/ProductScopePicker';
import SaleBadge from '@/components/SaleBadge';
import { useActiveProducts, useReorderProducts, Product } from '@/hooks/useProducts';
import { brandDisplayNames } from '@/lib/brandUtils';
import { ProductScope, filterByScope, scopeLabel } from '@/lib/productScopes';

const MoveProducts = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useActiveProducts();
  const reorder = useReorderProducts();

  const [scope, setScope] = useState<ProductScope | null>(null);
  const [order, setOrder] = useState<Product[]>([]);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const scopeList = useMemo(() => (scope ? filterByScope(products, scope) : []), [products, scope]);

  useEffect(() => {
    setOrder(scopeList);
    setMovingId(null);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, scopeList.length]);

  const moveToIndex = (id: string, targetIndex: number) => {
    setOrder((prev) => {
      const from = prev.findIndex((p) => p.id === id);
      if (from === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      const clamped = Math.max(0, Math.min(targetIndex, next.length));
      next.splice(clamped, 0, item);
      return next;
    });
    setDirty(true);
    setMovingId(null);
  };

  const nudge = (id: string, delta: number) => {
    const from = order.findIndex((p) => p.id === id);
    if (from === -1) return;
    moveToIndex(id, from + delta);
  };

  const save = async () => {
    if (!order.length) return;
    // Conservamos los huecos de orden que ya ocupaban estas prendas
    const raw = scopeList.map((p) => p.displayOrder).sort((a, b) => a - b);
    let prev = Number.NEGATIVE_INFINITY;
    const slots = raw.map((s) => {
      const v = s <= prev ? prev + 1 : s;
      prev = v;
      return v;
    });

    try {
      await reorder.mutateAsync(order.map((p, i) => ({ id: p.id, displayOrder: slots[i] ?? i })));
      toast.success('Orden guardado');
      setDirty(false);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar el orden. Inténtalo de nuevo.');
    }
  };

  const goBack = () => {
    if (scope) {
      if (dirty && !confirm('Hay cambios sin guardar. ¿Salir igualmente?')) return;
      setScope(null);
    } else {
      navigate('/subirprenda');
    }
  };

  const movingProduct = order.find((p) => p.id === movingId) ?? null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={goBack} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-serif text-xl tracking-wide">LA LOGGIA</h1>
            <p className="truncate text-xs text-muted-foreground uppercase tracking-wider">
              {scope ? `Mover · ${scopeLabel(scope)}` : 'Mover productos de posición'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-3 py-5 max-w-5xl mx-auto space-y-5">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Cargando prendas…</p>
        ) : !scope ? (
          <ProductScopePicker
            products={products}
            onSelect={setScope}
            hint="Elige la sección o la marca donde quieres cambiar el orden de las prendas."
          />
        ) : order.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No hay prendas en {scopeLabel(scope)}.</p>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              {movingProduct
                ? 'Toca el hueco donde quieres colocarla.'
                : 'Toca una prenda para cogerla, o usa las flechas para moverla un puesto.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {order.map((product, index) => {
                const isMoving = product.id === movingId;
                return (
                  <div key={product.id} className="relative">
                    {movingProduct && !isMoving && (
                      <button
                        type="button"
                        aria-label="Colocar aquí"
                        onClick={() => moveToIndex(movingProduct.id, index)}
                        className="absolute inset-0 z-20 rounded-lg border-2 border-dashed border-primary/70 bg-background/55 flex items-center justify-center text-[11px] uppercase tracking-widest text-foreground"
                      >
                        Colocar aquí
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setMovingId(isMoving ? null : product.id)}
                      className={`relative block w-full overflow-hidden rounded-lg border text-left transition-all ${
                        isMoving ? 'border-foreground ring-2 ring-foreground scale-[0.97]' : 'border-border'
                      }`}
                    >
                      {product.onSale && <SaleBadge />}
                      <span className="absolute top-2 right-2 z-10 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] text-background">
                        {index + 1}
                      </span>
                      <img
                        src={product.imageUrl}
                        alt={product.brand ? brandDisplayNames[product.brand] || product.brand : 'Prenda'}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[9/16] w-full object-cover"
                      />
                    </button>

                    <div className="mt-1 flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 flex-1"
                        disabled={index === 0}
                        onClick={() => nudge(product.id, -1)}
                        aria-label="Mover una posición antes"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 flex-1"
                        disabled={index === order.length - 1}
                        onClick={() => nudge(product.id, 1)}
                        aria-label="Mover una posición después"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {scope && movingProduct && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-full border bg-background/95 p-2 pr-3 shadow-lg backdrop-blur">
            <img src={movingProduct.imageUrl} alt="" className="h-10 w-8 rounded-full object-cover" />
            <span className="flex-1 text-xs text-muted-foreground">Moviendo esta prenda</span>
            <Button size="sm" variant="ghost" onClick={() => moveToIndex(movingProduct.id, 0)}>
              Al principio
            </Button>
            <Button size="sm" variant="ghost" onClick={() => moveToIndex(movingProduct.id, order.length)}>
              Al final
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setMovingId(null)} aria-label="Cancelar">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {scope && order.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-2">
            <Button
              variant="outline"
              className="h-12"
              disabled={!dirty || reorder.isPending}
              onClick={() => {
                setOrder(scopeList);
                setDirty(false);
                setMovingId(null);
              }}
            >
              Deshacer
            </Button>
            <Button className="h-12 flex-1" disabled={!dirty || reorder.isPending} onClick={save}>
              {reorder.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando…</>
              ) : dirty ? (
                <><Save className="h-4 w-4 mr-2" /> Guardar orden</>
              ) : (
                <><Move className="h-4 w-4 mr-2" /> Sin cambios</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveProducts;
