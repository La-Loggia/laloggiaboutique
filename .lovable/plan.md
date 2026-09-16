# Rebajas, menú por marcas/secciones y mover productos desde el móvil

Tres mejoras para la zona de subidas (la que usan los jefes) más una nueva sección pública de Rebajas.

## 1. Menú por secciones y marcas en "Eliminar productos"

Hoy la página de eliminar muestra todas las prendas seguidas. Pasa a tener una pantalla previa de elección:

- **Por sección**: Novedades, Ropa, Bolsos, Plumíferos, Camisetas, Espacio Jeans, Rebajas.
- **Por marca**: lista con el logo de cada marca (solo las que tienen prendas).

Al entrar en una sección o marca se ven solo esas prendas, con el mismo funcionamiento actual: tocar una prenda para eliminarla o "Seleccionar varios" para borrar en bloque. El borrado sigue siendo general (la prenda desaparece de toda la web) y se guarda 30 días en la papelera.

Este mismo menú de elección se reutiliza en los dos apartados nuevos.

## 2. Sección de Rebajas

- Cada prenda puede marcarse como "en rebajas".
- Las prendas en rebajas muestran una **banda roja diagonal-libre en la esquina superior izquierda de la foto con el texto "REBAJAS"**, en todas las cuadrículas de la web (novedades, marcas, secciones, bolsos) y también en la vista ampliada.
- Nueva página pública **/rebajas** con todas las prendas rebajadas, con su propio título y descripción para Google, enlazada desde el menú hamburguesa y añadida al mapa del sitio.
- Si no hay prendas rebajadas, la página muestra un mensaje y el enlace del menú se mantiene.

## 3. Botón rojo "Marcar productos de rebajas" (en subidas)

Nuevo botón rojo en la pantalla de subidas que abre la misma navegación por secciones/marcas. Dentro:

- Cada prenda se toca para marcarla o desmarcarla como rebajas (se ve al instante la banda roja sobre la miniatura).
- Modo "Seleccionar varios" para marcar o quitar rebajas en bloque.
- Las prendas marcadas aparecen automáticamente en /rebajas.

## 4. Botón "Mover productos de posición" (en subidas)

Nuevo botón con la misma navegación por secciones/marcas. Dentro de cada sección o marca, orden pensado para móvil:

- Tocar una prenda la "coge" (se ve levantada y aparece una barra inferior con su miniatura).
- Tocar el hueco donde quieres dejarla la coloca ahí; los indicadores de posición aparecen entre prendas.
- Flechas rápidas ← → sobre cada prenda para moverla un puesto, y botones "Al principio" / "Al final".
- Botón "Cancelar" siempre visible mientras se mueve.
- El cambio se guarda solo dentro de la sección o marca elegida, sin alterar el orden de las demás.

## Detalles técnicos

- Migración: columna `on_sale boolean not null default false` en `products`, con índice parcial. Lectura pública; escritura para `authenticated` y, como las páginas de jefes no usan login, una función `set_products_sale(_ids uuid[], _on_sale boolean)` SECURITY DEFINER con EXECUTE para `anon`/`authenticated`, igual que `soft_delete_products`.
- Reordenar sin login: función `reorder_products(_ids uuid[], _orders int[])` SECURITY DEFINER con EXECUTE para `anon`/`authenticated`; reasigna `display_order` respetando los huecos existentes del subconjunto.
- `useProducts.tsx`: añadir `onSale` a `Product`/`mapProduct`, hooks `useSaleProducts`, `useSetProductsSale`, `useReorderProducts`.
- Nuevo componente compartido `src/components/ProductScopePicker.tsx` (menú secciones/marcas) y `src/hooks/useScopedProducts.tsx` (filtro por ámbito sobre `useActiveProducts`).
- Nuevas páginas: `src/pages/SaleProducts.tsx` (/rebajas), `src/pages/MarkSaleProducts.tsx` (/subirprenda/rebajas), `src/pages/MoveProducts.tsx` (/subirprenda/mover); `DeleteProducts.tsx` pasa a usar el picker.
- Badge en `ProductCard.tsx`, `BolsosProductGrid.tsx` e `ImageViewer.tsx` con un componente `SaleBadge` y token rojo semántico nuevo en `index.css`/`tailwind.config.ts` (no se usan colores fijos en los componentes).
- Rutas en `App.tsx`, enlace en `MobileMenu.tsx`, entrada en `public/sitemap.xml`.
