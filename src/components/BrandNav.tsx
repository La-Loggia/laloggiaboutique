import { Brand, brands } from '@/data/products';

interface BrandNavProps {
  activeSection?: Brand | null;
  onBrandClick: (brand: Brand) => void;
}

const BrandNav = ({ activeSection, onBrandClick }: BrandNavProps) => {
  return (
    <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
      <div className="flex items-center justify-between px-3 py-2.5 overflow-x-auto scrollbar-hide">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandClick(brand)}
            className={`flex-shrink-0 px-3 py-1.5 font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
              activeSection === brand
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BrandNav;
