import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import coletteAsset from '@/assets/logo-colette.jpg.asset.json';

/**
 * Bloque de presentación de la nueva firma Colette Paris.
 * Banda oscura a ancho completo para máximo impacto visual en la home.
 */
const HomeColetteBlock = () => {
  return (
    <section
      id="colette-nueva-marca"
      aria-labelledby="colette-heading"
      className="relative overflow-hidden bg-foreground text-background"
    >
      {/* Textura sutil de líneas verticales */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 28px)',
        }}
      />

      {/* Halo suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-background/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-14 md:py-20 text-center">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-background/40" />
          <span className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-background/70">
            Nueva firma
          </span>
          <span className="h-px w-8 bg-background/40" />
        </div>

        {/* Logo */}
        <div className="mt-8 flex justify-center">
          <img
            src={coletteAsset.url}
            alt="Colette Paris, nueva marca de moda francesa en La Loggia"
            className="h-[110px] md:h-[150px] w-auto object-contain rounded-2xl"
            loading="lazy"
            decoding="async"
          />
        </div>

        <h2 id="colette-heading" className="sr-only">
          Colette Paris, nueva marca en La Loggia
        </h2>

        <p className="mt-10 font-serif text-2xl md:text-4xl font-light leading-tight text-background">
          Solo si te atreves a ser unica
        </p>

        <Link
          to="/marca/colette"
          className="group mt-10 inline-flex items-center gap-3 bg-background px-8 py-4 text-[11px] tracking-[0.25em] uppercase text-foreground transition-all duration-300 hover:bg-background/90"
        >
          Descubrir ahora
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        <p className="mt-6 font-sans text-[10px] tracking-[0.2em] uppercase text-background/50">
          solo en la loggia
        </p>
      </div>
    </section>
  );
};

export default HomeColetteBlock;
