import { stores, whatsappNumber } from '@/data/products';
import WhatsAppButton from './WhatsAppButton';
import { MapPin } from 'lucide-react';

const VisitSection = () => {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría hacer una consulta.')}`;

  return (
    <section className="py-12 px-4 bg-secondary/50">
      <h2 className="section-title text-center mb-8">Ven a Visitarnos</h2>
      
      <div className="space-y-8 max-w-md mx-auto">
        {stores.map((store) => (
          <div key={store.name} className="text-center">
            <h3 className="font-serif text-base font-medium text-foreground">
              {store.name}
            </h3>
            <p className="font-sans text-sm text-muted-foreground mt-1">
              {store.address}
            </p>
            <p className="font-sans text-xs text-muted-foreground/70 mb-3">
              {store.city}
            </p>
            <a
              href={store.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-300 hover:bg-foreground/80 active:scale-95"
            >
              <MapPin className="w-3 h-3" />
              Cómo Llegar
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <WhatsAppButton 
          href={whatsappUrl} 
          label="Pedidos y consultas por WhatsApp"
        />
      </div>
    </section>
  );
};

export default VisitSection;
