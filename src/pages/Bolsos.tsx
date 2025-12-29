import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import { BolsoBrand } from '@/hooks/useBolsos';

import logoReplay from '@/assets/logo-replay.png';
import logoRueMadam from '@/assets/logo-ruemadam.png';
import logoLolaCasademunt from '@/assets/logo-lolacasademunt.png';

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

const Bolsos = () => {
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
                <div className="flex items-center gap-2 text-foreground/60 group-hover:text-foreground transition-colors">
                  <span className="font-sans text-xs tracking-wide hidden sm:inline">Ver bolsos</span>
                  <ArrowRight className="w-4 h-4" />
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
