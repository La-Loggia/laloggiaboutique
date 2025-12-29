import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useProduct, useLatestProducts, useProductsByBrand, useProductImages } from '@/hooks/useProducts';
import { whatsappNumber } from '@/data/products';
import { Brand } from '@/data/products';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch the product by ID
  const { data: product, isLoading } = useProduct(productId || '');

  // Fetch additional images
  const { data: additionalImages = [] } = useProductImages(productId || '');

  // Fetch products from same brand (only when we have the product)
  const { data: brandProducts = [] } = useProductsByBrand(product?.brand as Brand);

  // Fetch all latest products for "also might like"
  const { data: allProducts = [] } = useLatestProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Producto no encontrado</p>
          <Link to="/novedades" className="text-primary underline">Volver a novedades</Link>
        </div>
      </div>
    );
  }

  // All images for this product
  const allImages = [product.imageUrl, ...additionalImages.map(img => img.imageUrl)];

  // Check if product is new (less than 7 days old)
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  // More from same brand (exclude current product, limit to 8)
  const moreBrandProducts = brandProducts
    .filter(p => p.id !== product.id)
    .slice(0, 8);

  // Also might like (products from other brands, limit to 12)
  const alsoLikeProducts = allProducts
    .filter(p => p.id !== product.id && p.brand !== product.brand)
    .slice(0, 12);

  // WhatsApp message with product info
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMessage = `Hola, me interesa este producto de ${product.brand} en La Loggia. Enlace: ${currentUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Breadcrumbs for SEO
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Novedades', url: '/novedades' },
    { name: product.brand, url: `/marca/${product.brand.toLowerCase()}` }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEOHead
        title={`${product.brand} - Moda Mujer | La Loggia`}
        description={`Descubre esta prenda de ${product.brand} en La Loggia. Moda femenina exclusiva en Altea, San Juan y Campello.`}
        canonicalPath={`/producto/${product.id}`}
        breadcrumbs={breadcrumbs}
      />

      <Header />

      {/* Back button */}
      <div className="px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      {/* Main product section */}
      <main className="px-3">
        {/* Product image - full width */}
        <div className="relative aspect-[9/16] max-w-lg mx-auto overflow-hidden bg-secondary">
          <img
            src={allImages[currentImageIndex]}
            alt={`Prenda de moda femenina - La Loggia`}
            className="w-full h-full object-cover"
          />
          {isNew && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              NOVEDAD
            </Badge>
          )}
        </div>

        {/* Thumbnail gallery - horizontal scroll */}
        {allImages.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto py-2 scrollbar-hide">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-24 shrink-0 overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Block 1: "También te puede interesar" - Same brand, 3-4 products, horizontal row */}
        {moreBrandProducts.length > 0 && (
          <section className="mt-10">
            <p className="text-sm text-muted-foreground text-center mb-4">También te puede interesar</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {moreBrandProducts.slice(0, 4).map((p, index) => (
                <Link 
                  key={p.id} 
                  to={`/producto/${p.id}`}
                  className="shrink-0 w-[140px] group"
                >
                  <div className="aspect-[9/16] overflow-hidden bg-secondary">
                    <img 
                      src={p.imageUrl} 
                      alt="Producto relacionado" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Block 2: "También te puede interesar" - Other brands, max 6, 2 per row */}
        {alsoLikeProducts.length > 0 && (
          <section className="mt-10 mb-8">
            <p className="text-sm text-muted-foreground text-center mb-4">También te puede interesar</p>
            <div className="grid grid-cols-2 gap-3">
              {alsoLikeProducts.slice(0, 6).map((p, index) => (
                <Link 
                  key={p.id} 
                  to={`/producto/${p.id}`}
                  className="group"
                >
                  <div className="aspect-[9/16] overflow-hidden bg-secondary">
                    <img 
                      src={p.imageUrl} 
                      alt="Producto relacionado" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky WhatsApp CTA */}
      <WhatsAppButton 
        href={whatsappUrl} 
        fixed 
        label="Consultar por WhatsApp" 
      />
    </div>
  );
};

export default ProductDetail;
