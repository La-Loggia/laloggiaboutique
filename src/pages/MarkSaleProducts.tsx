import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProductScopePicker from '@/components/ProductScopePicker';
import SaleBadge from '@/components/SaleBadge';
import { useActiveProducts, useSetProductsSale } from '@/hooks/useProducts';
import { brandDisplayNames } from '@/lib/brandUtils';
import { ProductScope, filterByScope, scopeLabel } from '@/lib/productScopes';

const MarkSaleProducts = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useActiveProducts();
  const setSale = useSetProductsSale();

  const [scope, setScope] = useState<ProductScope | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const list = useMemo(() => (scope ? filterByScope(products, scope) : []), [products, scope]);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const apply = async (ids: string[], onSale: boolean) => {
    try {
      await setSale.mutateAsync({ ids, onSale });
      toast.success(
        onSale
          ? ids.length === 1 ? 'Prenda marcada en rebajas' : `${ids.length} prendas marcadas en rebajas`
          : ids.length === 1 ? 'Prenda fuera de rebajas' : `${ids.length} prendas fuera de rebajas`
      );
      exitSelectMode();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar. Inténtalo de nuevo.');
    }
  };

  const goBack = () => {
    if (scope) {
      setScope(null);
      exitSelectMode();
    } else {
      navigate('/subirprenda');
    }
  };

  const selectedCount = selected.length;

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
              {scope ? `Rebajas · ${scopeLabel(scope)}` : 'Marcar productos de rebajas'}
            </p>
          </div>
          {scope && (
            <Button
              variant={selectMode ? 'default' : 'outline'}
              size="sm"
              className="ml-auto shrink-0"
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            >
              {selectMode ? (
                <><X className="h-4 w-4 mr-1.5" /> Cancelar</>
              ) : (
                <><CheckSquare className="h-4 w-4 mr-1.5" /> Varios</>
              )}
            </Button>
          )}
        </div>
      </header>

      <main className="px-3 py-5 max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Cargando prendas…</p>
        ) : !scope ? (
          <ProductScopePicker
            products={products}
            onSelect={setScope}
            accent="sale"
            hint="Elige la sección o la marca y marca las prendas que entran en rebajas."
          />
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No hay prendas en {scopeLabel(scope)}.</p>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Pulsa una prenda para ponerla o quitarla de rebajas. Aparecerá con la banda roja en la web.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {list.map((product) => {
                const isSelected = selected.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={setSale.isPending}
                    onClick={() =>
                      selectMode
                        ? setSelected((prev) =>
                            prev.includes(product.id) ? prev.filter((x) => x !== product.id) : [...prev, product.id]
                          )
                        : apply([product.id], !product.onSale)
                    }
                    className={`relative block w-full overflow-hidden rounded-lg border text-left transition-all ${
                      isSelected ? 'border-sale ring-2 ring-sale' : product.onSale ? 'border-sale/60' : 'border-border'
                    }`}
                  >
                    {product.onSale && <SaleBadge />}
                    <img
                      src={product.imageUrl}
                      alt={product.brand ? brandDisplayNames[product.brand] || product.brand : 'Prenda'}
                      loading="lazy"
                      decoding="async"
                      className={`aspect-[9/16] w-full object-cover transition-opacity ${product.onSale ? '' : 'opacity-90'}`}
                    />
                    {selectMode && (
                      <span
                        className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                          isSelected ? 'bg-sale text-sale-foreground border-sale' : 'bg-background/90 border-border'
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
          </>
        )}
      </main>

      {selectMode && selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-4">
          <div className="max-w-md mx-auto flex gap-2">
            <Button
              className="flex-1 h-12 bg-sale text-sale-foreground hover:bg-sale/90"
              disabled={setSale.isPending}
              onClick={() => apply(selected, true)}
            >
              {setSale.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Tag className="h-4 w-4 mr-2" /> Poner en rebajas ({selectedCount})</>}
            </Button>
            <Button
              variant="outline"
              className="h-12"
              disabled={setSale.isPending}
              onClick={() => apply(selected, false)}
            >
              Quitar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkSaleProducts;
