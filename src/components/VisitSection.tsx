import { stores, whatsappNumber } from '@/data/products';
import WhatsAppButton from './WhatsAppButton';
import { MapPin } from 'lucide-react';

const VisitSection = () => {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría hacer una consulta.')}`;

  return (
    <section className="py-12 px-4 bg-secondary/50" aria-label="Ubicaciones de La Loggia">
      <h2 className="section-title text-center mb-4">Ven a Visitarnos</h2>
      <p className="font-sans text-sm text-muted-foreground text-center mb-8 max-w-lg mx-auto">
        La Loggia cuenta con tiendas en Altea, San Juan y Campello, ofreciendo moda italiana de mujer en la provincia de Alicante.
      </p>
      
      <div className="space-y-8 max-w-md mx-auto" itemScope itemType="https://schema.org/Organization">
        <meta itemProp="name" content="La Loggia" />
        <meta itemProp="telephone" content="+34647763304" />
        <meta itemProp="url" content="https://laloggia.shop" />
        <meta itemProp="description" content="Boutique multimarca de moda femenina italiana con tiendas en Altea, San Juan y Campello, Alicante" />
        
        {stores.map((store) => (
          <article 
            key={store.name} 
            className="text-center"
            itemScope 
            itemType="https://schema.org/ClothingStore"
            itemProp="department"
          >
            <h3 
              className="font-serif text-base font-medium text-foreground"
              itemProp="name"
            >
              La Loggia {store.name}
            </h3>
            <meta itemProp="url" content="https://laloggia.shop" />
            <meta itemProp="telephone" content="+34647763304" />
            <meta itemProp="priceRange" content="€€-€€€" />
            
            <address className="not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <p className="font-sans text-sm text-muted-foreground mt-1" itemProp="streetAddress">
                {store.address}
              </p>
              <p className="font-sans text-xs text-muted-foreground/70 mb-3">
                <span itemProp="addressLocality">{store.city}</span>, <span itemProp="addressRegion">Alicante</span>, <span itemProp="addressCountry">España</span>
              </p>
            </address>
            
            <a
              href={store.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-300 hover:bg-foreground/80 active:scale-95"
              aria-label={`Cómo llegar a La Loggia ${store.name}`}
              itemProp="hasMap"
            >
              <MapPin className="w-3 h-3" aria-hidden="true" />
              Cómo Llegar
            </a>
          </article>
        ))}
      </div>

      {/* Hidden SEO content for store hours */}
      <div className="sr-only">
        <p>
          Horario de apertura La Loggia: Lunes a Viernes de 11:00 a 14:00 y de 18:00 a 21:00. 
          Sábados de 11:00 a 14:00. Domingos cerrado.
        </p>
        <p>
          Todas nuestras tiendas La Loggia Altea, La Loggia San Juan y La Loggia Campello 
          ofrecen atención personalizada y asesoramiento de moda.
        </p>
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
