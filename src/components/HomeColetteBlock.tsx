import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import coletteLogo from '@/assets/logo-colette.png';

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
            src={coletteLogo}
            alt="Colette Paris, nueva marca de moda francesa en La Loggia"
            className="h-[110px] md:h-[150px] w-auto object-contain invert"
            loading="lazy"
            decoding="async"
          />
        </div>

        <h2 id="colette-heading" className="sr-only">
          Colette Paris, nueva marca en La Loggia
        </h2>

        <p className="mt-8 font-serif text-lg md:text-2xl font-light leading-relaxed text-background">
          Elegancia parisina, ya disponible en La Loggia
        </p>

        <p className="mx-auto mt-4 max-w-xl font-sans text-xs md:text-sm leading-relaxed text-background/70">
          Líneas depuradas, tejidos cuidados y ese aire francés atemporal.
          Descubre la primera selección Colette Paris en nuestras boutiques de
          Altea, San Juan y El Campello.
        </p>

        <Link
          to="/marca/colette"
          className="group mt-9 inline-flex items-center gap-3 border border-background/50 px-7 py-3 text-[11px] tracking-[0.25em] uppercase text-background transition-colors duration-300 hover:bg-background hover:text-foreground"
        >
          Ver Colette Paris
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default HomeColetteBlock;
