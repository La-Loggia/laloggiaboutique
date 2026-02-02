import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Spacer for balance */}
        <div className="w-9 md:hidden" />
        
        {/* Logo centered */}
        <Link to="/" className="flex-1 text-center">
          <h1 className="font-serif text-xl tracking-[0.3em] font-medium text-foreground">
            LA LOGGIA
          </h1>
          <p className="font-sans text-[10px] tracking-[0.2em] text-muted-foreground mt-0.5 uppercase">
            Altea · San Juan · Campello
          </p>
        </Link>
        
        {/* Hamburger menu - mobile only */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
        
        {/* Spacer for desktop */}
        <div className="hidden md:block w-9" />
      </div>
    </header>
  );
};

export default Header;
