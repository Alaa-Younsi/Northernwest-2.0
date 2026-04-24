import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { useCategoryProducts } from '@/hooks/useProducts';
import type { Lang } from '@/types';

const CATEGORY_META: Record<string, { name: string; desc: string }> = {
  mouse: { name: 'Gaming Mouse', desc: 'Precision peripherals for competitive play.' },
  headphones: { name: 'Headphones', desc: 'Immersive audio built for domination.' },
  keyboards: { name: 'Mechanical Keyboards', desc: 'Tactile feedback, cyberpunk aesthetics.' },
};

export default function Category() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { products, loading } = useCategoryProducts(slug);
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const meta = CATEGORY_META[slug] ?? { name: slug, desc: '' };

  const sorted = [...products].filter(
    (p) => p.base_price >= priceRange[0] && p.base_price <= priceRange[1]
  ).sort((a, b) => {
    if (sort === 'price_asc') return a.base_price - b.base_price;
    if (sort === 'price_desc') return b.base_price - a.base_price;
    return new Date(b.id).getTime() - new Date(a.id).getTime();
  });

  // Determine category display name
  const nameKey = `name_${lang}` as const;
  const catName =
    (products[0]?.category as Record<string, unknown> | undefined)?.[nameKey] as string | undefined ||
    meta.name;

  return (
    <>
      <SEOHead
        title={`${meta.name} — Northernwest`}
        description={meta.desc}
      />

      {/* Category hero banner */}
      <div className="relative bg-[#0d0d0d] border-b border-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 red-grid-bg opacity-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-mono text-[#FF0000] text-xs uppercase tracking-widest mb-2">
              Category
            </p>
            <h1 className="font-display font-black text-white uppercase text-5xl md:text-6xl tracking-widest">
              {catName || t(`nav.${slug}`)}
            </h1>
            <p className="font-mono text-[#888888] text-sm mt-3">
              {sorted.length} products
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
              <CategoryFilter
                categories={[]}
                selected={[]}
                onToggle={() => {}}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                sort={sort}
                onSortChange={setSort}
                maxPrice={1000}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="text-center font-mono text-xs text-[#FF0000] tracking-[0.3em] py-2 border border-[#FF0000]/30 bg-[#FF0000]/5 mb-6">
              ✦ FREE SHIPPING ON ALL ORDERS ✦
            </div>
            <ProductGrid products={sorted} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}
