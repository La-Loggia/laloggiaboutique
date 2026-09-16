import { ChevronRight } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import {
  ProductScope,
  allBrands,
  countByScope,
  scopeKey,
  scopeLabel,
  sectionKeys,
} from '@/lib/productScopes';

interface ProductScopePickerProps {
  products: Product[];
  onSelect: (scope: ProductScope) => void;
  /** Texto de ayuda bajo el título */
  hint?: string;
  /** Color del contador destacado */
  accent?: 'default' | 'sale' | 'destructive';
}

const ProductScopePicker = ({ products, onSelect, hint, accent = 'default' }: ProductScopePickerProps) => {
  const sectionScopes: ProductScope[] = sectionKeys.map((value) => ({ type: 'section', value }));
  const brandScopes: ProductScope[] = allBrands
    .map((value) => ({ type: 'brand', value }) as ProductScope)
    .filter((scope) => countByScope(products, scope) > 0);

  const badgeClass =
    accent === 'sale'
      ? 'bg-sale/10 text-sale'
      : accent === 'destructive'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-secondary text-muted-foreground';

  const renderRow = (scope: ProductScope) => {
    const count = countByScope(products, scope);
    return (
      <button
        key={scopeKey(scope)}
        type="button"
        onClick={() => onSelect(scope)}
        disabled={count === 0}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-4 text-left transition-colors hover:bg-secondary/50 disabled:opacity-40"
      >
        <span className="flex-1 text-sm tracking-[0.08em] uppercase">{scopeLabel(scope)}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badgeClass}`}>{count}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {hint && <p className="text-center text-sm text-muted-foreground">{hint}</p>}

      <section className="space-y-2.5">
        <h2 className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Por sección</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">{sectionScopes.map(renderRow)}</div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Por marca</h2>
        {brandScopes.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">No hay prendas con marca asignada.</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">{brandScopes.map(renderRow)}</div>
        )}
      </section>
    </div>
  );
};

export default ProductScopePicker;
