import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { BolsoBrand } from '@/hooks/useBolsos';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import replayLogo from '@/assets/logo-replay.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import lolaCasademuntLogo from '@/assets/logo-lolacasademunt.png';

interface BolsosBrandNavProps {
  activeBrand?: BolsoBrand | null;
}

const bolsoBrands: BolsoBrand[] = ['Replay', 'RueMadam', 'LolaCasademunt'];

const brandLogos: Record<BolsoBrand, string> = {
  'Replay': replayLogo,
  'RueMadam': rueMadamLogo,
  'LolaCasademunt': lolaCasademuntLogo,
};

const brandDisplayNames: Record<BolsoBrand, string> = {
  'Replay': 'Replay',
  'RueMadam': 'Rue Madam Paris',
  'LolaCasademunt': 'Lola Casademunt',
};

const getBrandSlug = (brand: BolsoBrand): string => {
  const slugMap: Record<BolsoBrand, string> = {
    'Replay': 'replay',
    'RueMadam': 'rue-madam',
    'LolaCasademunt': 'lola-casademunt',
  };
  return slugMap[brand];
};

const BolsosBrandNav = ({ activeBrand }: BolsosBrandNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Back button */}
        <button
          onClick={() => navigate('/#bolsos-section')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs tracking-[0.15em] uppercase">Volver</span>
        </button>

        {/* Brand dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            Ver otras marcas
            <ChevronDown className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border border-border/50 min-w-[160px]">
            {bolsoBrands.map((brand) => (
              <DropdownMenuItem
                key={brand}
                asChild
                className={activeBrand === brand ? 'bg-muted' : ''}
              >
                <Link
                  to={`/bolsos/${getBrandSlug(brand)}`}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  <img 
                    src={brandLogos[brand]} 
                    alt={brandDisplayNames[brand]} 
                    className="h-5 w-auto object-contain grayscale opacity-70"
                  />
                  <span className="text-xs tracking-[0.1em] uppercase">{brandDisplayNames[brand]}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default BolsosBrandNav;
