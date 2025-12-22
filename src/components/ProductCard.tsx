import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

const ProductCard = ({ product, onClick, index }: ProductCardProps) => {
  // Generate SEO-friendly alt text
  const altText = `Moda ${product.brand} mujer en La Loggia - Boutique Alicante`;
  
  return (
    <article 
      className="animate-slide-up opacity-0 cursor-pointer group"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
      onClick={onClick}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="relative overflow-hidden bg-secondary">
        <img
          src={product.imageUrl}
          alt={altText}
          className="product-image transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          itemProp="image"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>
      <p className="brand-name text-center" itemProp="brand">{product.brand}</p>
      <meta itemProp="name" content={`Prenda ${product.brand} en La Loggia`} />
    </article>
  );
};

export default ProductCard;
