import { Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
          index={index}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
