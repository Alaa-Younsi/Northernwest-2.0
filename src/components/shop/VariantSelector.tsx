import type { ProductVariant } from '@/types';
import type { Lang } from '@/types';
import { useTranslation } from 'react-i18next';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selected, onSelect }: VariantSelectorProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language as Lang;

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const name =
          (variant[`name_${lang}` as keyof ProductVariant] as string) ||
          variant.name_en;
        const isSelected = selected?.id === variant.id;
        const outOfStock = variant.stock === 0;

        return (
          <button
            key={variant.id}
            onClick={() => !outOfStock && onSelect(variant)}
            disabled={outOfStock}
            className={`relative px-4 py-2 font-mono text-sm transition-all ${
              isSelected
                ? 'border-2 border-[#FF0000] bg-[#FF0000]/10 text-white'
                : outOfStock
                ? 'border border-[#1a1a1a] text-[#333] cursor-not-allowed line-through'
                : 'border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000] hover:text-white'
            }`}
          >
            {variant.color_hex && (
              <span
                className="inline-block w-3 h-3 rounded-full mr-2 border border-white/20"
                style={{ backgroundColor: variant.color_hex }}
              />
            )}
            {name}
            {variant.price_modifier !== 0 && (
              <span className="text-xs text-[#FF0000] ml-1">
                {variant.price_modifier > 0 ? '+' : ''}
                {variant.price_modifier}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
