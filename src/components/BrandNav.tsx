import { Link } from 'react-router-dom';
import { Brand, brands } from '@/data/products';

interface BrandNavProps {
  activeBrand?: Brand | null;
}

const getBrandSlug = (brand: Brand): string => {
  return brand.toLowerCase();
};

const BrandNav = ({ activeBrand }: BrandNavProps) => {
  return (
    <nav className="sticky top-[61px] z-40 bg-background border-b border-border/30">
      <div className="flex items-center justify-between px-3 py-2.5 overflow-x-auto scrollbar-hide">
        {brands.map((brand) => (
          <Link
            key={brand}
            to={`/marca/${getBrandSlug(brand)}`}
            className={`flex-shrink-0 px-3 py-1.5 font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
              activeBrand === brand
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {brand}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BrandNav;
