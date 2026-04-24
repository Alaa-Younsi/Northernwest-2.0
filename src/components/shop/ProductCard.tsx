import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { Lang } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const lang = i18n.language as Lang;

  const name =
    product[`name_${lang}` as keyof Product] as string || product.name_en;
  const price = product.base_price;
  const image = product.images[0];
  const categoryName =
    product.category
      ? ((product.category[`name_${lang}` as keyof typeof product.category] as string) ||
          product.category.name_en)
      : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.18)] transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-56 bg-[#111]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333] text-4xl font-display">
            NW
          </div>
        )}
        {/* Red overlay on hover */}
        <div className="absolute inset-0 bg-[#FF0000] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {/* Hover action */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 bg-[#FF0000] py-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Eye size={14} className="text-black" />
          <span className="font-display font-bold text-black text-sm uppercase tracking-widest">
            {t('product.view')}
          </span>
        </motion.div>

        {product.is_featured && (
          <div className="absolute top-2 left-2">
            <Badge>Featured</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {categoryName && (
          <p className="font-mono text-xs text-[#FF0000] uppercase tracking-widest mb-1">
            {categoryName}
          </p>
        )}
        <h3 className="font-display font-bold text-white text-lg uppercase leading-tight mb-2 line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-white font-semibold">
            ${price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 flex items-center justify-center border border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-black transition-colors"
            aria-label={t('product.addToCart')}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
