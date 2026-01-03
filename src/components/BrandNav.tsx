import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Brand, brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';
import rueMadamLogo from '@/assets/logo-ruemadam.png';
import jottLogo from '@/assets/logo-jott.png';
import lolaCasademuntLogo from '@/assets/logo-lolacasademunt.png';

interface BrandNavProps {
  activeBrand?: Brand | null;
}

const brandLogos: Record<Brand, string> = {
  'MOOR': moorLogo,
  'SaintTropez': saintTropezLogo,
  'DiLei': dileiLogo,
  'Mela': melaLogo,
  'Pecatto': pecattoLogo,
  'Dixie': dixieLogo,
  'Replay': replayLogo,
  'RueMadam': rueMadamLogo,
  'JOTT': jottLogo,
  'LolaCasademunt': lolaCasademuntLogo,
};

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const BrandNav = ({ activeBrand }: BrandNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Back button */}
        <button
          onClick={() => navigate('/#marcas-section')}
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
            {brands.map((brand) => (
              <DropdownMenuItem
                key={brand}
                asChild
                className={activeBrand === brand ? 'bg-muted' : ''}
              >
                <Link
                  to={`/marca/${getBrandSlug(brand)}`}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  <img 
                    src={brandLogos[brand]} 
                    alt={getBrandDisplayName(brand)}
                    className="h-5 w-auto object-contain grayscale opacity-70"
                  />
                  <span className="text-xs tracking-[0.1em] uppercase">{getBrandDisplayName(brand)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default BrandNav;
