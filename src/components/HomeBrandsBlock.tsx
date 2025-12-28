import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';

import logoMoor from '@/assets/logo-moor.png';
import logoSaintTropez from '@/assets/logo-sainttropez.png';
import logoDiLei from '@/assets/logo-dilei.png';
import logoMela from '@/assets/logo-mela.png';
import logoPecatto from '@/assets/logo-pecatto.png';
import logoDixie from '@/assets/logo-dixie.png';
import logoReplay from '@/assets/logo-replay.png';
import logoRueMadam from '@/assets/logo-ruemadam.png';
import logoJott from '@/assets/logo-jott.png';
import logoLolaCasademunt from '@/assets/logo-lolacasademunt.png';

// Logos maximized to fill button area
const brandLogos: Record<Brand, { src: string; height: string }> = {
  MOOR: { src: logoMoor, height: 'h-[120px]' },
  SaintTropez: { src: logoSaintTropez, height: 'h-[130px]' },
  DiLei: { src: logoDiLei, height: 'h-[125px]' },
  Mela: { src: logoMela, height: 'h-[150px]' },
  Pecatto: { src: logoPecatto, height: 'h-[140px]' },
  Dixie: { src: logoDixie, height: 'h-[105px]' },
  Replay: { src: logoReplay, height: 'h-[120px]' },
  RueMadam: { src: logoRueMadam, height: 'h-[125px]' },
  JOTT: { src: logoJott, height: 'h-[120px]' },
  LolaCasademunt: { src: logoLolaCasademunt, height: 'h-[120px]' },
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

      <div className="grid grid-cols-3 gap-3 px-4 max-w-lg mx-auto">
        {brands.filter((brand) => brand !== 'Replay').map((brand) => (
          <Link
            key={brand}
            to={`/marca/${getBrandSlug(brand)}`}
            className="group bg-secondary/30 border-2 border-border/40 py-0 flex items-center justify-center transition-all duration-300 hover:bg-foreground hover:border-foreground active:scale-95"
          >
            <img
              src={brandLogos[brand].src}
              alt={brand}
              className={`${brandLogos[brand].height} object-contain grayscale opacity-80 group-hover:invert group-hover:opacity-100 transition-all duration-300`}
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBrandsBlock;
