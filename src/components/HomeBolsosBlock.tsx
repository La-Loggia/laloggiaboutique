import { Link } from 'react-router-dom';
import { BolsoBrand } from '@/hooks/useBolsos';

import bannerReplay from '@/assets/banner-replay.png';
import bannerRueMadam from '@/assets/banner-ruemadam.png';
import bannerLolaCasademunt from '@/assets/banner-lolacasademunt.png';

interface BolsosBrandInfo {
  brand: BolsoBrand;
  slug: string;
  banner: string;
  displayName: string;
}

const bolsosBrands: BolsosBrandInfo[] = [
  {
    brand: 'Replay',
    slug: 'replay',
    banner: bannerReplay,
    displayName: 'Replay',
  },
  {
    brand: 'RueMadam',
    slug: 'rue-madam',
    banner: bannerRueMadam,
    displayName: 'Rue Madam Paris',
  },
  {
    brand: 'LolaCasademunt',
    slug: 'lola-casademunt',
    banner: bannerLolaCasademunt,
    displayName: 'Lola Casademunt',
  },
];

const HomeBolsosBlock = () => {
  return (
    <section id="bolsos-section" className="py-10">
      <Link to="/bolsos" className="block text-center mb-8 group">
        <h2 className="section-title group-hover:text-foreground/80 transition-colors">Bolsos</h2>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          Complementos con estilo propio
        </p>
        <div className="w-12 h-px bg-border mx-auto mt-4" />
      </Link>

      <div className="flex flex-col gap-4 px-4 max-w-2xl mx-auto">
        {bolsosBrands.map((item) => (
          <Link
            key={item.brand}
            to={`/bolsos/${item.slug}`}
            className="group block overflow-hidden transition-all duration-300 hover:opacity-90 hover:scale-[1.01]"
          >
            <img
              src={item.banner}
              alt={`Ver bolsos de ${item.displayName}`}
              className="w-full h-auto object-cover"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeBolsosBlock;
