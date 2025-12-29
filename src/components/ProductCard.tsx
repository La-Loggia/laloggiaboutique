import { Link } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  index: number;
  isHero?: boolean;
  showBadge?: boolean;
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
  'LolaCasademunt': 'diseño español',
};

const ProductCard = ({ product, onClick, index, isHero = false, showBadge = false }: ProductCardProps) => {
  const category = brandCategories[product.brand] || 'exclusivo';
  
  // Generate descriptive, SEO-friendly alt text
  const altText = `Prenda ${category} de ${product.brand} para mujer - La Loggia boutique Alicante`;

  // Check if product is recent (less than 7 days old)
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  
  const content = (
    <article 
      className={`animate-slide-up opacity-0 group ${isHero ? 'col-span-2 md:col-span-2 lg:col-span-2' : ''}`}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className={`relative overflow-hidden bg-secondary ${isHero ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
        <img
          src={product.imageUrl}
          alt={altText}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          itemProp="image"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        
        {/* Badge NOVEDAD */}
        {showBadge && isNew && (
          <Badge 
            className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5"
          >
            NOVEDAD
          </Badge>
        )}
      </div>
      <p className="brand-name text-center mt-2" itemProp="brand">{product.brand}</p>
      <meta itemProp="name" content={`Moda ${product.brand} mujer en La Loggia`} />
      <meta itemProp="description" content={`${product.brand} - Colección de moda femenina ${category} disponible en La Loggia Altea, San Juan y Campello`} />
    </article>
  );

  // If onClick is provided (legacy behavior), use it
  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }

  // Otherwise, use Link for SEO-friendly navigation
  return (
    <Link 
      to={`/producto/${product.id}`} 
      className="cursor-pointer block"
      itemProp="url"
    >
      {content}
    </Link>
  );
};

export default ProductCard;
