import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BrandMarquee from '@/components/BrandMarquee';
import VisitSection from '@/components/VisitSection';
import SEOHead from '@/components/SEOHead';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: '¿Dónde puedo comprar moda italiana de mujer en Alicante?',
    a: 'En La Loggia tienes tres boutiques en la provincia de Alicante: Altea, San Juan de Alicante y El Campello. Las tres reúnen una selección cuidada de firmas italianas exclusivas para mujer.',
  },
  {
    q: '¿Qué marcas italianas trabaja La Loggia?',
    a: 'Trabajamos con firmas italianas como MOOR, Saint Tropez, DiLei, Mela, Pecatto, Dixie y Rue Madam, además de marcas europeas como Replay, JOTT y Lola Casademunt.',
  },
  {
    q: '¿Cuál es el estilo de la moda italiana que vendéis?',
    a: 'Una moda femenina, contemporánea y elegante: cortes limpios, tejidos naturales, paleta neutra y prendas atemporales que combinan artesanía italiana y un estilo mediterráneo muy reconocible.',
  },
  {
    q: '¿Tenéis novedades cada temporada?',
    a: 'Sí. Renovamos colección de forma continua. Puedes ver las últimas incorporaciones en el apartado de Novedades de la web o pasarte por cualquiera de nuestras tres tiendas.',
  },
  {
    q: '¿Cómo puedo contactar con La Loggia?',
    a: 'Por WhatsApp en el +34 647 763 304 o visitándonos en Altea, San Juan de Alicante o El Campello. Te asesoramos personalmente sobre tallas, looks y disponibilidad.',
  },
];

const ModaItalianaAlicante = () => {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://laloggia.shop/moda-italiana-mujer-alicante#webpage',
      url: 'https://laloggia.shop/moda-italiana-mujer-alicante',
      name: 'Moda italiana de mujer en Alicante | La Loggia',
      description:
        'Moda italiana de mujer en Alicante: firmas como MOOR, Saint Tropez, DiLei, Mela, Pecatto, Dixie y Rue Madam en La Loggia, con boutiques en Altea, San Juan y Campello.',
      inLanguage: 'es-ES',
      isPartOf: { '@id': 'https://laloggia.shop/#website' },
      about: { '@id': 'https://laloggia.shop/#organization' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://laloggia.shop/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Moda italiana de mujer en Alicante',
            item: 'https://laloggia.shop/moda-italiana-mujer-alicante',
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Moda italiana de mujer en Alicante | La Loggia"
        description="Moda italiana de mujer en Alicante. Firmas como MOOR, Saint Tropez, DiLei, Mela, Pecatto, Dixie y Rue Madam en La Loggia: boutiques en Altea, San Juan y Campello."
        canonicalPath="/moda-italiana-mujer-alicante"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Moda italiana de mujer en Alicante', url: '/moda-italiana-mujer-alicante' },
        ]}
        structuredData={structuredData}
      />

      <Header />
      <BrandMarquee />

      <main className="px-5 md:px-8 max-w-3xl mx-auto">
        <header className="text-center pt-10 pb-8">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
            La Loggia · Alicante
          </p>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-foreground leading-tight tracking-wide">
            Moda italiana de mujer en Alicante
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Boutiques en Altea, San Juan y El Campello con firmas italianas exclusivas
            para una mujer contemporánea y elegante.
          </p>
        </header>

        <section className="py-6 space-y-5 font-sans text-sm leading-relaxed text-foreground/90">
          <p>
            En <strong>La Loggia</strong> creemos en una forma muy concreta de entender la moda femenina:
            la <strong>moda italiana</strong>. Cortes limpios, tejidos naturales, paleta neutra y prendas
            atemporales que se llevan año tras año sin perder vigencia. Una propuesta pensada para la
            mujer de <strong>Alicante</strong> que busca calidad, autenticidad y un estilo reconocible.
          </p>
          <p>
            Nuestra selección reúne firmas italianas como <strong>MOOR</strong>,{' '}
            <strong>Saint Tropez</strong>, <strong>DiLei</strong>, <strong>Mela</strong>,{' '}
            <strong>Pecatto</strong>, <strong>Dixie</strong> y <strong>Rue Madam</strong>, junto a
            marcas europeas como Replay, JOTT y Lola Casademunt. Una mezcla equilibrada de artesanía
            italiana y diseño mediterráneo, presente en cada una de nuestras tres boutiques.
          </p>
        </section>

        <section className="py-6">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">
            Tres boutiques en la provincia de Alicante
          </h2>
          <ul className="space-y-3 font-sans text-sm text-foreground/90">
            <li>
              <strong>La Loggia Altea</strong> — C. Comte d'Altea, 58. Un espacio luminoso en pleno
              centro de Altea con la esencia mediterránea de la firma.
            </li>
            <li>
              <strong>La Loggia San Juan</strong> — Centro Comercial Torregolf, San Juan de Alicante.
              Punto de referencia para la mujer del área metropolitana de Alicante.
            </li>
            <li>
              <strong>La Loggia Campello</strong> — C. Sant Bartomeu, 41. La boutique más cercana a
              la costa, con una selección renovada cada temporada.
            </li>
          </ul>
        </section>

        <section className="py-6">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">
            Una forma italiana de vestir
          </h2>
          <p className="font-sans text-sm leading-relaxed text-foreground/90">
            La moda italiana de mujer que encontrarás en La Loggia se apoya en tres ideas: tejidos
            nobles que respiran, patrones cómodos pensados para el día a día y un equilibrio entre lo
            clásico y lo actual. Prendas que funcionan tanto para una jornada de trabajo en Alicante
            como para un paseo por la costa al atardecer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/novedades"
              className="inline-block px-5 py-2.5 text-xs tracking-[0.2em] uppercase border border-foreground/80 text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Ver novedades
            </Link>
            <Link
              to="/bolsos"
              className="inline-block px-5 py-2.5 text-xs tracking-[0.2em] uppercase border border-foreground/30 text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Bolsos
            </Link>
          </div>
        </section>

        <section className="py-8 border-t border-border/30">
          <h2 className="font-serif text-xl font-light text-foreground mb-4 text-center">
            Preguntas frecuentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-sans text-sm">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-sm leading-relaxed text-foreground/80">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <div className="border-t border-border/30" />
      <VisitSection />
    </div>
  );
};

export default ModaItalianaAlicante;
