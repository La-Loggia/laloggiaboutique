import type { Brand } from '@/data/products';
import { brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';
import type { Product, ProductCategory } from '@/hooks/useProducts';

export type SectionKey = 'novedades' | 'ropa' | 'bolsos' | 'plumiferos' | 'camisetas' | 'jeans' | 'rebajas';

export type ProductScope =
  | { type: 'section'; value: SectionKey }
  | { type: 'brand'; value: Brand };

export const sectionLabels: Record<SectionKey, string> = {
  novedades: 'Novedades',
  ropa: 'Ropa',
  bolsos: 'Bolsos',
  plumiferos: 'Plumíferos / Chalecos',
  camisetas: 'Camisetas',
  jeans: 'Espacio Jeans',
  rebajas: 'Rebajas',
};

export const sectionKeys: SectionKey[] = [
  'novedades',
  'ropa',
  'bolsos',
  'plumiferos',
  'camisetas',
  'jeans',
  'rebajas',
];

export const allBrands: Brand[] = brands;

export const scopeLabel = (scope: ProductScope): string =>
  scope.type === 'section' ? sectionLabels[scope.value] : getBrandDisplayName(scope.value);

export const scopeKey = (scope: ProductScope): string => `${scope.type}:${scope.value}`;

const matchesScope = (product: Product, scope: ProductScope): boolean => {
  if (scope.type === 'brand') {
    return product.brand === scope.value && product.showInBrand;
  }
  if (scope.value === 'novedades') return product.showInLatest;
  if (scope.value === 'rebajas') return product.onSale;
  return product.category === (scope.value as ProductCategory) && product.showInSection;
};

/** Devuelve las prendas del ámbito, ordenadas igual que en la web pública */
export const filterByScope = (products: Product[], scope: ProductScope): Product[] =>
  products
    .filter((p) => matchesScope(p, scope))
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

export const countByScope = (products: Product[], scope: ProductScope): number =>
  products.filter((p) => matchesScope(p, scope)).length;
