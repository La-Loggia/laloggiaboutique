import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const HomeBrandsBlock = () => {
  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <h2 className="section-title">Ver Novedades por Marca</h2>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          Toca una marca para ver sus últimas novedades
        </p>
        <div className="w-12 h-px bg-border mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto">
        {brands.map((brand) => (
          <Link
            key={brand}
            to={`/marca/${getBrandSlug(brand)}`}
            className="group bg-secondary/30 border-2 border-border/40 py-6 text-center transition-all duration-300 hover:bg-foreground hover:border-foreground active:scale-95"
          >
            <span className="font-sans text-xs tracking-[0.2em] uppercase text-foreground group-hover:text-background transition-colors">
              {brand}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBrandsBlock;
