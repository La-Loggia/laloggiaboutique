import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const HomeBrandsBlock = () => {
  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <h2 className="section-title">Nuestras Marcas</h2>
        <div className="w-12 h-px bg-border mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto">
        {brands.map((brand) => (
          <Link
            key={brand}
            to={`/marca/${getBrandSlug(brand)}`}
            className="bg-secondary/30 border border-border/30 py-6 text-center transition-all duration-300 hover:bg-secondary/50 hover:border-foreground/20"
          >
            <span className="font-sans text-xs tracking-[0.2em] uppercase text-foreground">
              {brand}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBrandsBlock;
