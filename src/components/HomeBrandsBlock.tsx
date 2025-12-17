import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';

import logoMoor from '@/assets/logo-moor.png';
import logoSaintTropez from '@/assets/logo-sainttropez.png';
import logoDiLei from '@/assets/logo-dilei.png';
import logoMela from '@/assets/logo-mela.png';
import logoPecatto from '@/assets/logo-pecatto.png';
import logoDixie from '@/assets/logo-dixie.png';
import logoReplay from '@/assets/logo-replay.png';

const brandLogos: Record<Brand, string> = {
  MOOR: logoMoor,
  SaintTropez: logoSaintTropez,
  DiLei: logoDiLei,
  Mela: logoMela,
  Pecatto: logoPecatto,
  Dixie: logoDixie,
  Replay: logoReplay,
};

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
            className="group bg-secondary/30 border-2 border-border/40 py-6 flex items-center justify-center transition-all duration-300 hover:bg-foreground hover:border-foreground active:scale-95"
          >
            <img
              src={brandLogos[brand]}
              alt={brand}
              className="h-6 object-contain grayscale opacity-80 group-hover:invert group-hover:opacity-100 transition-all duration-300"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBrandsBlock;
