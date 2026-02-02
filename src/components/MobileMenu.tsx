import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { brands } from '@/data/products';
import { getBrandDisplayName } from '@/lib/brandUtils';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  const getBrandSlug = (brand: string): string => brand.toLowerCase();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          className="p-2 text-foreground hover:text-muted-foreground transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 bg-background">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        <nav className="flex flex-col py-6">
          {/* Novedades */}
          <Link 
            to="/novedades" 
            onClick={handleLinkClick}
            className="px-6 py-3 text-sm tracking-[0.15em] uppercase text-foreground hover:bg-muted/50 transition-colors"
          >
            Novedades marcas
          </Link>

          {/* Bolsos */}
          <div className="border-t border-border/30">
            <button
              onClick={() => toggleSection('bolsos')}
              className="w-full flex items-center justify-between px-6 py-3 text-sm tracking-[0.15em] uppercase text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Bolsos</span>
              {expandedSections['bolsos'] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections['bolsos'] && (
              <div className="bg-muted/30">
                <Link 
                  to="/bolsos/ruemadam" 
                  onClick={handleLinkClick}
                  className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Rue Madam
                </Link>
                <Link 
                  to="/bolsos/lolacasademunt" 
                  onClick={handleLinkClick}
                  className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Lola Casademunt
                </Link>
              </div>
            )}
          </div>

          {/* Marcas */}
          <div className="border-t border-border/30">
            <button
              onClick={() => toggleSection('marcas')}
              className="w-full flex items-center justify-between px-6 py-3 text-sm tracking-[0.15em] uppercase text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Marcas</span>
              {expandedSections['marcas'] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections['marcas'] && (
              <div className="bg-muted/30">
                {brands.map((brand) => (
                  <Link 
                    key={brand}
                    to={`/marca/${getBrandSlug(brand)}`} 
                    onClick={handleLinkClick}
                    className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {getBrandDisplayName(brand)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Plumíferos */}
          <div className="border-t border-border/30">
            <button
              onClick={() => toggleSection('plumiferos')}
              className="w-full flex items-center justify-between px-6 py-3 text-sm tracking-[0.15em] uppercase text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Plumíferos</span>
              {expandedSections['plumiferos'] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections['plumiferos'] && (
              <div className="bg-muted/30">
                <Link 
                  to="/marca/jott" 
                  onClick={handleLinkClick}
                  className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  JOTT
                </Link>
              </div>
            )}
          </div>

          {/* Camisetas */}
          <div className="border-t border-border/30">
            <button
              onClick={() => toggleSection('camisetas')}
              className="w-full flex items-center justify-between px-6 py-3 text-sm tracking-[0.15em] uppercase text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Camisetas</span>
              {expandedSections['camisetas'] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections['camisetas'] && (
              <div className="bg-muted/30">
                <Link 
                  to="/marca/vicolo" 
                  onClick={handleLinkClick}
                  className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Vicolo
                </Link>
                <Link 
                  to="/marca/mela" 
                  onClick={handleLinkClick}
                  className="block px-8 py-2.5 text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Mela
                </Link>
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
