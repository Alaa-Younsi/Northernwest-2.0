import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { useProduct, useCategoryProducts } from '@/hooks/useProducts';
import { VariantSelector } from '@/components/shop/VariantSelector';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/components/ui/Toast';
import type { Lang, ProductVariant } from '@/types';

export default function Product() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { product, loading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);

  // Related products
  const categorySlug = product?.category?.slug ?? '';
  const { products: related } = useCategoryProducts(categorySlug);
  const relatedFiltered = related.filter((p) => p.id !== product?.id).slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-[#888888]">{t('common.loading')}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-[#888888]">Product not found</div>
      </div>
    );
  }

  const name = (product[`name_${lang}` as keyof typeof product] as string) || product.name_en;
  const description =
    (product[`description_${lang}` as keyof typeof product] as string) ||
    product.description_en ||
    '';
  const categoryName = product.category
    ? ((product.category[`name_${lang}` as keyof typeof product.category] as string) ||
        product.category.name_en)
    : '';

  const effectiveVariant = selectedVariant ?? product.variants?.[0] ?? null;
  const price = product.base_price + (effectiveVariant?.price_modifier ?? 0);
  const stock = effectiveVariant?.stock ?? 999;
  const stockStatus =
    stock === 0
      ? 'outOfStock'
      : stock < 5
      ? 'lowStock'
      : 'inStock';

  const handleAddToCart = () => {
    addItem(product, effectiveVariant ?? undefined, quantity);
    toast.success(`${name} added to cart`);
  };

  return (
    <>
      <SEOHead
        title={`${name} — Northernwest`}
        description={description.slice(0, 160)}
        image={product.images[0]}
        productSchema={{
          name,
          price,
          description,
          image: product.images[0] ?? '',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Left: Images ── */}
          <div>
            {/* Main image */}
            <div className="relative bg-[#0d0d0d] border border-[#1a1a1a] h-96 md:h-[500px] overflow-hidden mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[activeImage] ?? ''}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {!product.images[activeImage] && (
                <div className="absolute inset-0 flex items-center justify-center text-[#333] text-6xl font-display">
                  NW
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 border-2 overflow-hidden transition-colors ${
                      idx === activeImage
                        ? 'border-[#FF0000]'
                        : 'border-[#1a1a1a] hover:border-[#888888]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col">
            {categoryName && (
              <Badge variant="red" className="self-start mb-4">
                {categoryName}
              </Badge>
            )}

            <h1 className="font-display font-black text-white uppercase text-4xl md:text-5xl leading-tight mb-4">
              {name}
            </h1>

            <div className="font-mono text-white font-bold text-3xl mb-6">
              ${price.toFixed(2)}
              <span className="text-sm text-[#888888] font-normal ml-2">USD</span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-3">
                  {t('product.variants')}
                </p>
                <VariantSelector
                  variants={product.variants}
                  selected={effectiveVariant}
                  onSelect={setSelectedVariant}
                />
              </div>
            )}

            {/* Stock */}
            <div className="mb-6">
              <span
                className={`font-mono text-xs uppercase tracking-widest ${
                  stockStatus === 'inStock'
                    ? 'text-green-400'
                    : stockStatus === 'lowStock'
                    ? 'text-yellow-400'
                    : 'text-[#cc0000]'
                }`}
              >
                ● {t(`product.${stockStatus}`)}
                {stockStatus === 'lowStock' && ` (${stock} left)`}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest">
                {t('product.quantity')}
              </span>
              <div className="flex items-center border border-[#1a1a1a]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-mono text-sm text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              variant={stock === 0 ? 'ghost' : 'primary'}
              size="lg"
              disabled={stock === 0}
              onClick={handleAddToCart}
              className="w-full mb-6"
            >
              {stock === 0 ? t('product.outOfStock') : t('product.addToCart')}
            </Button>

            {/* Description accordion */}
            <div className="border-t border-[#1a1a1a] pt-4">
              <button
                onClick={() => setDescOpen((o) => !o)}
                className="flex items-center justify-between w-full font-display font-bold uppercase text-sm tracking-widest text-white py-3"
              >
                {t('product.description')}
                {descOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {descOpen && description && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="font-mono text-[#888888] text-sm leading-relaxed pb-4">
                      {description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedFiltered.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display font-black text-white uppercase tracking-widest text-3xl mb-8">
              {t('product.relatedProducts')}
            </h2>
            <ProductGrid products={relatedFiltered} />
          </div>
        )}
      </div>
    </>
  );
}
