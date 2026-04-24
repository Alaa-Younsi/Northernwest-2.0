import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import type { Lang } from '@/types';
import { useState } from 'react';

const schema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email required'),
  customer_phone: z.string().optional(),
  shipping_address: z.string().min(5, 'Address is required'),
  shipping_city: z.string().min(2, 'City is required'),
  shipping_country: z.string().min(2, 'Country is required'),
  shipping_zip: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof schema>;

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      const { order_number } = await api.orders.create({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        address_line1: data.shipping_address,
        city: data.shipping_city,
        country: data.shipping_country,
        zip_code: data.shipping_zip,
        notes: data.notes,
        items: items
          .map((item) => ({
            variant_id: item.variant?.id ?? item.product.variants?.[0]?.id ?? '',
            quantity: item.quantity,
          }))
          .filter((i) => i.variant_id !== ''),
      });
      clearCart();
      navigate(`/order-confirmation/${order_number}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#050505] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none transition-colors';

  return (
    <>
      <SEOHead title="Checkout — Northernwest" description="Complete your Northernwest order." />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-display font-black text-white uppercase text-4xl tracking-widest mb-12">
          {t('checkout.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.fullName')} *
              </label>
              <input {...register('customer_name')} className={inputClass} />
              {errors.customer_name && (
                <p className="font-mono text-xs text-[#FF0000] mt-1">
                  {errors.customer_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.email')} *
              </label>
              <input
                {...register('customer_email')}
                type="email"
                className={inputClass}
              />
              {errors.customer_email && (
                <p className="font-mono text-xs text-[#FF0000] mt-1">
                  {errors.customer_email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.phone')}
              </label>
              <input
                {...register('customer_phone')}
                type="tel"
                className={inputClass}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.address')} *
              </label>
              <input {...register('shipping_address')} className={inputClass} />
              {errors.shipping_address && (
                <p className="font-mono text-xs text-[#FF0000] mt-1">
                  {errors.shipping_address.message}
                </p>
              )}
            </div>

            {/* City + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                  {t('checkout.city')} *
                </label>
                <input {...register('shipping_city')} className={inputClass} />
                {errors.shipping_city && (
                  <p className="font-mono text-xs text-[#FF0000] mt-1">
                    {errors.shipping_city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                  {t('checkout.country')} *
                </label>
                <input {...register('shipping_country')} className={inputClass} />
                {errors.shipping_country && (
                  <p className="font-mono text-xs text-[#FF0000] mt-1">
                    {errors.shipping_country.message}
                  </p>
                )}
              </div>
            </div>

            {/* ZIP */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.zip')}
              </label>
              <input {...register('shipping_zip')} className={inputClass} />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                {t('checkout.notes')}
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full mt-6"
            >
              {submitting ? t('checkout.processing') : t('checkout.submitOrder')}
            </Button>
          </form>

          {/* Order Summary */}
          <div>
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
              <h2 className="font-display font-bold text-white uppercase tracking-widest text-lg mb-6 border-b border-[#1a1a1a] pb-4">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-4">
                {items.map((item) => {
                  const name =
                    (item.product[`name_${lang}` as keyof typeof item.product] as string) ||
                    item.product.name_en;
                  const variantName = item.variant
                    ? (item.variant[`name_${lang}` as keyof typeof item.variant] as string) ||
                      item.variant.name_en
                    : null;
                  const price =
                    item.product.base_price + (item.variant?.price_modifier ?? 0);

                  return (
                    <div
                      key={`${item.product.id}-${item.variant?.id}`}
                      className="flex justify-between items-start gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-display font-bold text-white text-sm uppercase">
                          {name}
                        </p>
                        {variantName && (
                          <p className="font-mono text-xs text-[#888888]">
                            {variantName}
                          </p>
                        )}
                        <p className="font-mono text-xs text-[#888888]">
                          ×{item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-white text-sm">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#1a1a1a] mt-6 pt-4 flex justify-between items-center">
                <span className="font-mono text-[#888888] uppercase tracking-widest text-sm">
                  {t('cart.total')}
                </span>
                <span className="font-mono text-white font-bold text-xl">
                  ${totalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
