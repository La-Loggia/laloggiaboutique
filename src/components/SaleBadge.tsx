interface SaleBadgeProps {
  className?: string;
}

/** Banda roja "REBAJAS" en la esquina superior izquierda de la foto */
const SaleBadge = ({ className = '' }: SaleBadgeProps) => (
  <span
    className={`absolute top-0 left-0 z-10 bg-sale text-sale-foreground text-[9px] md:text-[10px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1 shadow-sm pointer-events-none ${className}`}
  >
    Rebajas
  </span>
);

export default SaleBadge;
