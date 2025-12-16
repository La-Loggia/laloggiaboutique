import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';

// Logos with optical height adjustments for visual balance (~60px base)
const brandLogos = [
  { src: moorLogo, alt: 'MOOR', height: 'h-[38px]' },
  { src: saintTropezLogo, alt: 'Saint Tropez', height: 'h-[44px]' },
  { src: dileiLogo, alt: 'DiLei', height: 'h-[40px]' },
  { src: melaLogo, alt: 'Mela', height: 'h-[52px]' },
  { src: pecattoLogo, alt: 'Pecatto', height: 'h-[48px]' },
  { src: replayLogo, alt: 'Replay', height: 'h-[39px]' },
  { src: dixieLogo, alt: 'Dixie', height: 'h-[32px]' },
];

const BrandMarquee = () => {
  // Triple the logos for seamless infinite scroll
  const duplicatedLogos = [...brandLogos, ...brandLogos, ...brandLogos];

  return (
    <div className="bg-secondary/30 border-b border-border/30 overflow-hidden">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
        {duplicatedLogos.map((logo, index) => (
          <img
            key={`${logo.alt}-${index}`}
            src={logo.src}
            alt={logo.alt}
            className={`${logo.height} w-auto object-contain select-none opacity-70 grayscale`}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandMarquee;
