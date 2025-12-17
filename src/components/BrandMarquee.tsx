import replayLogo from '@/assets/logo-replay.png';
import dixieLogo from '@/assets/logo-dixie.png';
import saintTropezLogo from '@/assets/logo-sainttropez.png';
import moorLogo from '@/assets/logo-moor.png';
import dileiLogo from '@/assets/logo-dilei.png';
import melaLogo from '@/assets/logo-mela.png';
import pecattoLogo from '@/assets/logo-pecatto.png';

// Logos with optical height adjustments for visual balance (~60px base)
const brandLogos = [
  { src: moorLogo, alt: 'MOOR', height: 'h-[48px]' },
  { src: saintTropezLogo, alt: 'Saint Tropez', height: 'h-[54px]' },
  { src: dileiLogo, alt: 'DiLei', height: 'h-[50px]' },
  { src: melaLogo, alt: 'Mela', height: 'h-[62px]' },
  { src: pecattoLogo, alt: 'Pecatto', height: 'h-[58px]' },
  { src: replayLogo, alt: 'Replay', height: 'h-[49px]' },
  { src: dixieLogo, alt: 'Dixie', height: 'h-[42px]' },
];

const BrandMarquee = () => {
  return (
    <div className="bg-secondary/30 border-b border-border/30 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-secondary/30 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-secondary/30 to-transparent z-10 pointer-events-none" />
      
      <div className="flex">
        {/* First set - animates */}
        <div className="animate-marquee flex items-center shrink-0">
          {brandLogos.map((logo, index) => (
            <img
              key={`first-${logo.alt}-${index}`}
              src={logo.src}
              alt={logo.alt}
              className={`${logo.height} w-auto object-contain select-none opacity-70 grayscale mx-8`}
              draggable={false}
            />
          ))}
        </div>
        {/* Second set - follows first for seamless loop */}
        <div className="animate-marquee flex items-center shrink-0">
          {brandLogos.map((logo, index) => (
            <img
              key={`second-${logo.alt}-${index}`}
              src={logo.src}
              alt={logo.alt}
              className={`${logo.height} w-auto object-contain select-none opacity-70 grayscale mx-8`}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
