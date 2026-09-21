import { Link } from 'react-router-dom';
import coletteBannerDesktop from '@/assets/colette-banner-desktop.webp';
import coletteBannerMobile from '@/assets/colette-banner-mobile.webp';

/**
 * Bloque de presentación de la nueva firma Colette Paris.
 * - Escritorio: banner horizontal (1920x640) enlazado a la marca.
 * - Móvil: banner cuadrado (1312x1199) enlazado a la marca.
 */
const HomeColetteBlock = () => {
  return (
    <section
      id="colette-nueva-marca"
      aria-labelledby="colette-heading"
      className="relative"
    >
      <h2 id="colette-heading" className="sr-only">
        Colette Paris, nueva marca en La Loggia
      </h2>

      {/* Banner de escritorio (texto y CTA integrados en la imagen) */}
      <Link
        to="/marca/colette"
        aria-label="Colette Paris, nueva firma — descubrir colección"
        className="group relative hidden md:block"
      >
        <img
          src={coletteBannerDesktop.url}
          alt="Colette Paris, nueva firma en La Loggia — el chic parisino, con alma italiana. Descubrir colección, solo en La Loggia"
          className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-95"
          loading="lazy"
          decoding="async"
        />
        {/* Difuminado hacia el fondo blanco de la web (arriba y abajo) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        />
      </Link>

      {/* Banner de móvil (texto y CTA integrados en la imagen) */}
      <Link
        to="/marca/colette"
        aria-label="Colette Paris, nueva firma — descubrir colección"
        className="group relative block md:hidden"
      >
        <img
          src={coletteBannerMobile.url}
          alt="Colette Paris, nueva firma en La Loggia — el chic parisino, con alma italiana. Descubrir colección, solo en La Loggia"
          className="w-full h-auto object-cover transition-opacity duration-300 group-active:opacity-95"
          loading="lazy"
          decoding="async"
        />
        {/* Difuminado hacia el fondo blanco de la web (arriba y abajo) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
        />
      </Link>
    </section>
  );
};

export default HomeColetteBlock;
