import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
  featured?: boolean;
}

// Map brand names to descriptive categories for better alt text
const brandCategories: Record<string, string> = {
  'MOOR': 'elegante italiano',
  'SaintTropez': 'escandinavo contemporáneo',
  'DiLei': 'italiano exclusivo',
  'Mela': 'británico con estilo',
  'Pecatto': 'moderno con personalidad',
  'Dixie': 'urbano italiano',
  'Replay': 'denim premium',
  'RueMadam': 'elegancia parisina',
  'JOTT': 'técnico de alta gama',
};

const ProductCard = ({ product, onClick, index, featured = false }: ProductCardProps) => {
  const category = brandCategories[product.brand] || 'exclusivo';
  
  // Generate descriptive, SEO-friendly alt text
  const altText = `Prenda ${category} de ${product.brand} para mujer - La Loggia boutique Alicante`;
  
  return (
    <article 
      className="animate-slide-up opacity-0 cursor-pointer group"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
      onClick={onClick}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className={`relative overflow-hidden bg-secondary ${featured ? 'aspect-[9/16]' : ''}`}>
        <img
          src={product.imageUrl}
          alt={altText}
          className={`product-image transition-transform duration-500 group-hover:scale-105 ${featured ? 'object-cover w-full h-full' : ''}`}
          loading="lazy"
          itemProp="image"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>
      <p className={`brand-name text-center ${featured ? 'text-sm mt-2' : ''}`} itemProp="brand">{product.brand}</p>
      <meta itemProp="name" content={`Moda ${product.brand} mujer en La Loggia`} />
      <meta itemProp="description" content={`${product.brand} - Colección de moda femenina ${category} disponible en La Loggia Altea, San Juan y Campello`} />
      <link itemProp="url" href={`https://laloggia.shop/marca/${product.brand.toLowerCase()}`} />
    </article>
  );
};

export default ProductCard;
