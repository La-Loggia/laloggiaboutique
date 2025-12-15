const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="px-4 py-3 text-center">
        <h1 className="font-serif text-xl tracking-[0.3em] font-medium text-foreground">
          LA LOGGIA
        </h1>
        <p className="font-sans text-[10px] tracking-[0.2em] text-muted-foreground mt-0.5 uppercase">
          Boutique · Altea · San Juan · Campello
        </p>
      </div>
    </header>
  );
};

export default Header;
