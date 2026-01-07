import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';

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
import logoVicolo from '@/assets/logo-vicolo.png';

// Logos with responsive heights (smaller on mobile, larger on desktop)
const brandLogos: Record<Brand, { src: string; heightMobile: string; heightDesktop: string }> = {
  MOOR: { src: logoMoor, heightMobile: 'h-[70px]', heightDesktop: 'md:h-[100px]' },
  SaintTropez: { src: logoSaintTropez, heightMobile: 'h-[75px]', heightDesktop: 'md:h-[110px]' },
  DiLei: { src: logoDiLei, heightMobile: 'h-[72px]', heightDesktop: 'md:h-[105px]' },
  Mela: { src: logoMela, heightMobile: 'h-[85px]', heightDesktop: 'md:h-[125px]' },
  Pecatto: { src: logoPecatto, heightMobile: 'h-[80px]', heightDesktop: 'md:h-[115px]' },
  Dixie: { src: logoDixie, heightMobile: 'h-[60px]', heightDesktop: 'md:h-[85px]' },
  Replay: { src: logoReplay, heightMobile: 'h-[70px]', heightDesktop: 'md:h-[100px]' },
  RueMadam: { src: logoRueMadam, heightMobile: 'h-[72px]', heightDesktop: 'md:h-[105px]' },
  JOTT: { src: logoJott, heightMobile: 'h-[70px]', heightDesktop: 'md:h-[100px]' },
  LolaCasademunt: { src: logoLolaCasademunt, heightMobile: 'h-[70px]', heightDesktop: 'md:h-[100px]' },
  Vicolo: { src: logoVicolo, heightMobile: 'h-[70px]', heightDesktop: 'md:h-[100px]' },
};

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const HomeBrandsBlock = () => {
  return (
    <section id="marcas-section" className="py-10">
      <div className="text-center mb-8">
        <h2 className="section-title">Ver Novedades por Marca</h2>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          Toca una marca para ver sus últimas novedades
        </p>
        <div className="w-12 h-px bg-border mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 px-4 max-w-4xl mx-auto">
        {brands.filter((brand) => brand !== 'Replay').map((brand) => (
          <Link
            key={brand}
            to={`/marca/${getBrandSlug(brand)}`}
            className="group bg-secondary/30 border-2 border-border/40 py-0 flex items-center justify-center transition-all duration-300 hover:bg-foreground hover:border-foreground active:scale-95"
          >
            <img
              src={brandLogos[brand].src}
              alt={getBrandDisplayName(brand)}
              className={`${brandLogos[brand].heightMobile} ${brandLogos[brand].heightDesktop} object-contain grayscale opacity-80 group-hover:invert group-hover:opacity-100 transition-all duration-300`}
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBrandsBlock;
