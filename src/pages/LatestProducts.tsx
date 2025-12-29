import Header from '@/components/Header';
import BrandNav from '@/components/BrandNav';
import ProductGrid from '@/components/ProductGrid';
import SEOHead from '@/components/SEOHead';
import { useLatestProducts } from '@/hooks/useProducts';

const LatestProducts = () => {
  const { data: allProducts = [], isLoading } = useLatestProducts();

  // Breadcrumbs for structured navigation
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Novedades', url: '/novedades' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Novedades Moda Mujer | La Loggia Altea, San Juan, Campello"
        description="Últimas novedades en moda femenina italiana de La Loggia. Nuevas colecciones MOOR, Saint Tropez, DiLei, Dixie y más marcas europeas. Boutiques en Altea, San Juan y Campello."
        canonicalPath="/novedades"
        breadcrumbs={breadcrumbs}
      />
      
      <Header />
      <BrandNav />

      <main className="py-6">
        <header className="text-center mb-6">
          <h1 className="section-title">Últimas Novedades</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2">
            Nuevas llegadas a La Loggia
          </p>
          <div className="w-12 h-px bg-border mx-auto mt-3" />
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : allProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay novedades disponibles</p>
        ) : (
          <ProductGrid products={allProducts} showBadge />
        )}
      </main>
    </div>
  );
};

export default LatestProducts;
