import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onToggle: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  maxPrice?: number;
}

export function CategoryFilter({
  categories,
  selected,
  onToggle,
  priceRange,
  onPriceChange,
  sort,
  onSortChange,
  maxPrice = 1000,
}: CategoryFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="font-display font-bold uppercase text-sm tracking-widest text-white mb-3">
          {t('common.sort')}
        </h3>
        <div className="space-y-2">
          {[
            { value: 'newest', label: t('common.newest') },
            { value: 'price_asc', label: t('common.priceAsc') },
            { value: 'price_desc', label: t('common.priceDesc') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`block w-full text-left font-mono text-xs py-1.5 px-2 transition-colors ${
                sort === option.value
                  ? 'text-[#FF0000] bg-[#FF0000]/10'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {sort === option.value && '▶ '}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-display font-bold uppercase text-sm tracking-widest text-white mb-3">
            {t('nav.categories')}
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat)}
                  onChange={() => onToggle(cat)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected.includes(cat)
                      ? 'border-[#FF0000] bg-[#FF0000]'
                      : 'border-[#1a1a1a] group-hover:border-[#FF0000]'
                  }`}
                >
                  {selected.includes(cat) && (
                    <svg viewBox="0 0 10 8" width="10" height="8" fill="black">
                      <path d="M1 4l3 3 5-6" strokeWidth="1.5" stroke="black" fill="none" />
                    </svg>
                  )}
                </span>
                <span className="font-mono text-xs text-[#888888] group-hover:text-white transition-colors capitalize">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-display font-bold uppercase text-sm tracking-widest text-white mb-3">
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between font-mono text-xs text-[#888888]">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
