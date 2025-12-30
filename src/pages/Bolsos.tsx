import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import { BolsoBrand } from '@/hooks/useBolsos';
import { Brand, brands } from '@/data/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import logoReplay from '@/assets/logo-replay.png';
import logoRueMadam from '@/assets/logo-ruemadam.png';
import logoLolaCasademunt from '@/assets/logo-lolacasademunt.png';

import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';
import jottLogo from '@/assets/logo-jott.png';

interface BolsosBrandInfo {
  brand: BolsoBrand;
  slug: string;
  logo: string;
  tagline: string;
  displayName: string;
}

const bolsosBrands: BolsosBrandInfo[] = [
  {
    brand: 'Replay',
    slug: 'replay',
    logo: logoReplay,
    tagline: 'Diseño italiano con carácter urbano',
    displayName: 'Replay',
  },
  {
    brand: 'RueMadam',
    slug: 'rue-madam',
    logo: logoRueMadam,
    tagline: 'Elegancia parisina atemporal',
    displayName: 'Rue Madam Paris',
  },
  {
    brand: 'LolaCasademunt',
    slug: 'lola-casademunt',
    logo: logoLolaCasademunt,
    tagline: 'Estilo español con personalidad',
    displayName: 'Lola Casademunt',
  },
];

// Brands to show in "Ver más novedades" dropdown (exclude bolsos brands)
const bolsoBrandNames: Brand[] = ['Replay', 'RueMadam', 'LolaCasademunt'];
const novedadesBrands = brands.filter(brand => !bolsoBrandNames.includes(brand));

const brandLogos: Record<Brand, string> = {
  'MOOR': moorLogo,
  'SaintTropez': saintTropezLogo,
  'DiLei': dileiLogo,
  'Mela': melaLogo,
  'Pecatto': pecattoLogo,
  'Dixie': dixieLogo,
  'Replay': logoReplay,
  'RueMadam': logoRueMadam,
  'JOTT': jottLogo,
  'LolaCasademunt': logoLolaCasademunt,
};

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const Bolsos = () => {
  const navigate = useNavigate();
  
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Bolsos', url: '/bolsos' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bolsos para Mujer | La Loggia Alicante"
        description="Bolsos de las mejores marcas en La Loggia. Replay, Rue Madam Paris y Lola Casademunt. Bolsos para mujer en Altea, San Juan y Campello."
        canonicalPath="/bolsos"
        breadcrumbs={breadcrumbs}
      />
      
      <Header />

      {/* Navigation bar */}
      <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-[0.15em] uppercase">Volver</span>
          </button>

          {/* Novedades dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              Ver más novedades
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border/50 min-w-[160px]">
              {novedadesBrands.map((brand) => (
                <DropdownMenuItem
                  key={brand}
                  asChild
                >
                  <Link
                    to={`/marca/${getBrandSlug(brand)}`}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  >
                    <img 
                      src={brandLogos[brand]} 
                      alt={brand} 
                      className="h-5 w-auto object-contain grayscale opacity-70"
                    />
                    <span className="text-xs tracking-[0.1em] uppercase">{brand}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="py-10">
        <div className="text-center mb-8">
          <h1 className="section-title">Bolsos</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2">
            Complementos con estilo propio
          </p>
          <div className="w-12 h-px bg-border mx-auto mt-4" />
        </div>

        <div className="flex flex-col gap-6 px-4 max-w-lg mx-auto">
          {bolsosBrands.map((item) => (
            <Link
              key={item.brand}
              to={`/bolsos/${item.slug}`}
              className="group block bg-secondary/20 border border-border/30 p-6 transition-all duration-300 hover:bg-secondary/40 hover:border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <img
                    src={item.logo}
                    alt={item.displayName}
                    className="h-10 md:h-12 object-contain grayscale opacity-70 group-hover:opacity-90 transition-opacity"
                  />
                  <p className="font-sans text-xs text-muted-foreground mt-3 tracking-wide">
                    {item.tagline}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Bolsos;
