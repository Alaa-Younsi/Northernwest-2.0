import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="404 — Page Not Found" />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="font-display font-black text-[#FF0000] text-[120px] md:text-[200px] leading-none select-none">
            404
          </div>
          <h1 className="font-display font-black text-white uppercase text-3xl tracking-widest mb-4">
            {t('common.notFound')}
          </h1>
          <p className="font-mono text-[#888888] text-sm mb-8">
            {t('common.notFoundSub')}
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              {t('common.goHome')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
