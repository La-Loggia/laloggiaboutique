import { brands } from '@/data/products';

const BrandMarquee = () => {
  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="bg-secondary/30 border-b border-border/30 overflow-hidden py-3">
      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {duplicatedBrands.map((brand, index) => (
          <span
            key={`${brand}-${index}`}
            className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70 select-none"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BrandMarquee;
