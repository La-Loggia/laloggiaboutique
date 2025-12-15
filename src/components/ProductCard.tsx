import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

const ProductCard = ({ product, onClick, index }: ProductCardProps) => {
  return (
    <article 
      className="animate-slide-up opacity-0 cursor-pointer group"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-secondary">
        <img
          src={product.imageUrl}
          alt={`Prenda de ${product.brand}`}
          className="product-image transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>
      <p className="brand-name text-center">{product.brand}</p>
    </article>
  );
};

export default ProductCard;
