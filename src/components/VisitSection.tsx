import { stores, whatsappNumber } from '@/data/products';
import WhatsAppButton from './WhatsAppButton';

const VisitSection = () => {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría hacer una consulta.')}`;

  return (
    <section className="py-12 px-4 bg-secondary/50">
      <h2 className="section-title text-center mb-8">Ven a Visitarnos</h2>
      
      <div className="space-y-6 max-w-md mx-auto">
        {stores.map((store) => (
          <div key={store.name} className="text-center">
            <h3 className="font-serif text-base font-medium text-foreground">
              {store.name}
            </h3>
            <p className="font-sans text-sm text-muted-foreground mt-1">
              {store.address}
            </p>
            <p className="font-sans text-xs text-muted-foreground/70">
              {store.city}
            </p>
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
