import { Product } from '@/hooks/useProducts';
import { getBrandDisplayName } from '@/lib/brandUtils';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
  featured?: boolean;
  hideBrandName?: boolean;
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
  'Vicolo': 'moda italiana',
};

const ProductCard = ({ product, onClick, index, featured = false, hideBrandName = false }: ProductCardProps) => {
  const category = product.brand ? (brandCategories[product.brand] || 'exclusivo') : 'exclusivo';
  
  // Generate descriptive, SEO-friendly alt text
  const brandName = product.brand ? getBrandDisplayName(product.brand) : 'Espacio Jeans';
  const altText = `Prenda ${category} de ${brandName} para mujer - La Loggia boutique Alicante`;
  
  // First 4 products are above the fold and should load with priority
  const isPriority = index < 4;
  
  // Responsive image sizes based on grid layout
  const imageSizes = featured 
    ? '(max-width: 640px) 100vw, 50vw' 
    : '(max-width: 640px) 50vw, 25vw';
  
  // Max width to request based on featured status
  const maxWidth = featured ? 1200 : 800;
  
  return (
    <article 
      className="animate-slide-up opacity-0 cursor-pointer group"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
      onClick={onClick}
    >
      <div className={`relative overflow-hidden bg-secondary ${featured ? 'aspect-[9/16]' : 'aspect-[9/16]'}`}>
        <OptimizedImage
          src={product.imageUrl}
          alt={altText}
          className="w-full h-full"
          priority={isPriority}
          sizes={imageSizes}
          maxWidth={maxWidth}
          quality={featured ? 80 : 75}
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 pointer-events-none" />
      </div>
      {!hideBrandName && (
        <p className={`brand-name text-center ${featured ? 'text-sm mt-2' : ''}`}>
          {product.category === 'jeans' ? 'ESPACIO JEANS' : getBrandDisplayName(product.brand)}
        </p>
      )}
    </article>
  );
};

export default ProductCard;
