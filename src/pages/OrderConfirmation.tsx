import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Order Confirmed — Northernwest" />

      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-lg w-full bg-[#0d0d0d] border border-[#1a1a1a] p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle size={64} className="text-[#FF0000]" />
          </motion.div>

          <h1 className="font-display font-black text-white uppercase text-4xl tracking-widest mb-4">
            {t('order.confirmationTitle')}
          </h1>

          <div className="border border-[#FF0000] px-6 py-4 mb-6 inline-block">
            <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-1">
              {t('order.orderNumber')}
            </p>
            <p className="font-mono text-[#FF0000] font-bold text-xl">
              {orderNumber}
            </p>
          </div>

          <p className="font-mono text-[#888888] text-sm leading-relaxed mb-8">
            {t('order.thankYou')}
          </p>

          <Link to="/shop">
            <Button variant="primary" size="lg">
              {t('order.continueShopping')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
