import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { useProducts } from '@/hooks/useProducts';
import { Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function Shop() {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { products, total, loading } = useProducts({ sort, page });

  const filtered = products.filter((p) => {
    const inCategory =
      selectedCategories.length === 0 ||
      (p.category && selectedCategories.includes(p.category.slug));
    const inPrice =
      p.base_price >= priceRange[0] && p.base_price <= priceRange[1];
    return inCategory && inPrice;
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <>
      <SEOHead
        title="Shop — All Products"
        description="Browse all Northernwest gaming peripherals. Mechanical keyboards, gaming mice, headphones."
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-white uppercase text-4xl tracking-widest">
              {t('common.allProducts')}
            </h1>
            <p className="font-mono text-[#888888] text-xs mt-1">
              {filtered.length} products
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 font-mono text-xs text-[#888888] hover:text-white border border-[#1a1a1a] px-3 py-2"
          >
            <Filter size={14} />
            {t('common.filter')}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={`w-64 flex-shrink-0 ${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
              <CategoryFilter
                categories={['mouse', 'headphones', 'keyboards']}
                selected={selectedCategories}
                onToggle={(cat) =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev, cat]
                  )
                }
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                sort={sort}
                onSortChange={setSort}
                maxPrice={1000}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="text-center font-mono text-xs text-[#FF0000] tracking-[0.3em] py-2 border border-[#FF0000]/30 bg-[#FF0000]/5 mb-6">
              ✦ FREE SHIPPING ON ALL ORDERS ✦
            </div>
            <ProductGrid products={filtered} loading={loading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 font-mono text-sm transition-colors ${
                      page === i + 1
                        ? 'bg-[#FF0000] text-black'
                        : 'border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000] hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
