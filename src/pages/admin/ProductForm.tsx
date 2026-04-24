import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import type { Product, Category } from '@/types';

const variantSchema = z.object({
  id: z.string().optional(),
  name_en: z.string().min(1),
  name_fr: z.string().min(1),
  name_ar: z.string().min(1),
  sku: z.string().min(1),
  price_modifier: z.number().default(0),
  stock: z.number().int().min(0).default(0),
  color_hex: z.string().optional(),
});

const schema = z.object({
  category_id: z.string().min(1, 'Category required'),
  name_en: z.string().min(1),
  name_fr: z.string().min(1),
  name_ar: z.string().min(1),
  description_en: z.string().optional(),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  base_price: z.number().min(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
});

type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  product: Product | null;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.categories.getAll()
      .then((data) => {
        if (!data || data.length === 0) {
          toast.error('No categories found. Run supabase/seed.sql first.');
        }
        setCategories(data ?? []);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load categories';
        console.error('[ProductForm] categories fetch failed:', err);
        toast.error(`Categories error: ${msg}`);
      });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: product?.category_id ?? '',
      name_en: product?.name_en ?? '',
      name_fr: product?.name_fr ?? '',
      name_ar: product?.name_ar ?? '',
      description_en: product?.description_en ?? '',
      description_fr: product?.description_fr ?? '',
      description_ar: product?.description_ar ?? '',
      base_price: product?.base_price ?? 0,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      images: product?.images ?? [],
      variants: product?.variants?.map((v) => ({
        id: v.id,
        name_en: v.name_en,
        name_fr: v.name_fr,
        name_ar: v.name_ar,
        sku: v.sku,
        price_modifier: v.price_modifier,
        stock: v.stock,
        color_hex: v.color_hex ?? '',
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const images = watch('images');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setValue('images', [...images, ...urls]);
      toast.success('Images uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-[#050505] border border-[#1a1a1a] px-3 py-2.5 font-mono text-xs text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none';
  const labelClass = 'block font-mono text-xs text-[#888888] uppercase tracking-widest mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Category */}
      <div>
        <label className={labelClass}>Category *</label>
        <select {...register('category_id')} className={`${inputClass} cursor-pointer`}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>
        {errors.category_id && <p className="font-mono text-xs text-[#FF0000] mt-1">{errors.category_id.message}</p>}
      </div>

      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['en', 'fr', 'ar'] as const).map((lang) => (
          <div key={lang}>
            <label className={labelClass}>Name ({lang.toUpperCase()}) *</label>
            <input {...register(`name_${lang}`)} className={inputClass} />
          </div>
        ))}
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['en', 'fr', 'ar'] as const).map((lang) => (
          <div key={lang}>
            <label className={labelClass}>Description ({lang.toUpperCase()})</label>
            <textarea {...register(`description_${lang}`)} rows={3} className={`${inputClass} resize-none`} />
          </div>
        ))}
      </div>

      {/* Price + Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Base Price *</label>
          <input
            type="number"
            step="0.01"
            {...register('base_price', { valueAsNumber: true })}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-4 mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="sr-only" />
            <span className="font-mono text-xs text-[#888888]">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="sr-only" />
            <span className="font-mono text-xs text-[#888888]">Featured</span>
          </label>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className={labelClass}>Images</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`Product ${i + 1}`} className="w-16 h-16 object-cover border border-[#1a1a1a]" />
              <button
                type="button"
                onClick={() => setValue('images', images.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF0000] text-black text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-16 h-16 border border-dashed border-[#1a1a1a] flex flex-col items-center justify-center cursor-pointer hover:border-[#FF0000] transition-colors">
            <Upload size={14} className="text-[#888888]" />
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="sr-only" />
          </label>
        </div>
        {uploading && <p className="font-mono text-xs text-[#888888]">Uploading...</p>}
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Variants</label>
          <button
            type="button"
            onClick={() =>
              append({ name_en: '', name_fr: '', name_ar: '', sku: '', price_modifier: 0, stock: 0, color_hex: '' })
            }
            className="flex items-center gap-1 font-mono text-xs text-[#FF0000] hover:text-white transition-colors"
          >
            <Plus size={12} /> Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="border border-[#1a1a1a] p-4 relative">
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-2 right-2 text-[#888888] hover:text-[#FF0000] transition-colors"
              >
                <Trash2 size={13} />
              </button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Name EN</label>
                  <input {...register(`variants.${idx}.name_en`)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Name FR</label>
                  <input {...register(`variants.${idx}.name_fr`)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Name AR</label>
                  <input {...register(`variants.${idx}.name_ar`)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SKU</label>
                  <input {...register(`variants.${idx}.sku`)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Price Modifier</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`variants.${idx}.price_modifier`, { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    type="number"
                    {...register(`variants.${idx}.stock`, { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Color Hex</label>
                  <div className="flex gap-2">
                    <input {...register(`variants.${idx}.color_hex`)} placeholder="#FF0000" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[#1a1a1a]">
        <Button type="submit" variant="primary" loading={saving}>
          Save Product
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
