import { brands } from '@/data/products';
import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.jpg';
import saintTropezLogo from '@/assets/logo-sainttropez.png';

const BrandMarquee = () => {
  // Create items array with brands and logos interspersed
  const brandItems = [...brands, 'REPLAY', 'DIXIE', 'SAINTTROPEZ'] as const;
  const duplicatedItems = [...brandItems, ...brandItems, ...brandItems];

  return (
    <div className="bg-secondary/30 border-b border-border/30 overflow-hidden py-3">
      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {duplicatedItems.map((item, index) => (
          item === 'REPLAY' ? (
            <img
              key={`replay-${index}`}
              src={replayLogo}
              alt="Replay"
              className="h-[27px] w-auto object-contain select-none opacity-70"
            />
          ) : item === 'DIXIE' ? (
            <img
              key={`dixie-${index}`}
              src={dixieLogo}
              alt="Dixie"
              className="h-[20px] w-auto object-contain select-none opacity-70"
            />
          ) : item === 'SAINTTROPEZ' || item === 'SaintTropez' ? (
            <img
              key={`sainttropez-${index}`}
              src={saintTropezLogo}
              alt="Saint Tropez"
              className="h-[50px] w-auto object-contain select-none opacity-70"
            />
          ) : (
            <span
              key={`${item}-${index}`}
              className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70 select-none"
            >
              {item}
            </span>
          )
        ))}
      </div>
    </div>
  );
};

export default BrandMarquee;
