import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { useFeaturedProducts, useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { MouseIcon, HeadphonesIcon, KeyboardIcon } from '@/components/icons';
import { KeyboardWithTerminal } from '@/components/ui/KeyboardWithTerminal';
import { api } from '@/lib/api';

// ── Animated Counter ──────────────────────────────────────────────────────
function Counter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-2xl font-bold text-[#FF0000]">
        {count}
        {target === 50 ? '+' : ''}
      </div>
      <div className="font-mono text-xs text-[#888888] uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

// ── Category Cards ────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'mouse', desc: 'Precision tracking for competitive play' },
  { slug: 'headphones', desc: 'Immersive audio, built for domination' },
  { slug: 'keyboards', desc: 'Tactile feedback, cyberpunk aesthetics' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  mouse: <MouseIcon size={48} />,
  headphones: <HeadphonesIcon size={48} />,
  keyboards: <KeyboardIcon size={48} />,
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function Home() {
  const { t } = useTranslation();
  const { products: featured, loading: featLoading } = useFeaturedProducts();
  const { products: newArrivals, loading: newLoading } = useProducts({ sort: 'newest', page: 1 });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await api.newsletter.subscribe(email);
      setSubscribed(true);
      setEmail('');
    } catch {
      // Fail silently — duplicate emails are ignored by API
      setSubscribed(true);
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <SEOHead />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center overflow-hidden">
        {/* LEFT */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-16 z-10">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.15 }}
            className="lg:-translate-y-8"
          >
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="font-mono text-[#888888] text-sm uppercase tracking-[0.3em] mb-4"
            >
              Northernwest
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="font-display font-black text-white leading-none mb-2 glitch-text"
              data-text="GEAR UP YOUR SETUP"
              style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
            >
              GEAR UP YOUR{' '}
              <span className="relative inline-block text-white glitch-underline">
                SETUP
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="font-mono text-[#888888] text-base mt-6 mb-8 max-w-md leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link to="/shop">
                <Button variant="primary" size="lg">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/category/keyboards">
                <Button variant="secondary" size="lg">
                  View Keyboards
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex gap-8"
            >
              <Counter target={3} label={t('hero.stat1')} />
              <Counter target={50} label={t('hero.stat2')} />
              <Counter target={1} label={t('hero.stat3')} />
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT: Terminal + 60% Keyboard */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 lg:py-0 z-10">
          <KeyboardWithTerminal />
        </div>

        {/* Diagonal cut */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-[#050505] z-10 hidden lg:block"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
        />
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-white uppercase tracking-widest text-3xl md:text-4xl mb-12 text-center"
        >
          {t('sections.categories')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: '#FF0000' }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="block bg-[#0d0d0d] border border-[#1a1a1a] p-8 hover:shadow-[0_0_20px_rgba(255,0,0,0.18)] transition-all group"
              >
                <div className="mb-4 text-[#FF0000]">{CATEGORY_ICONS[cat.slug]}</div>
                <h3 className="font-display font-bold text-white uppercase tracking-widest text-xl mb-2 group-hover:text-[#FF0000] transition-colors">
                  {t(`nav.${cat.slug}`)}
                </h3>
                <p className="font-mono text-[#888888] text-xs leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ───────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display font-black text-white uppercase tracking-widest text-3xl md:text-4xl">
            {t('sections.featured')}
          </h2>
          <Link
            to="/shop"
            className="font-mono text-xs text-[#FF0000] hover:text-white transition-colors uppercase tracking-widest"
          >
            View All →
          </Link>
        </div>
        <ProductGrid products={featured.slice(0, 4)} loading={featLoading} />
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <div className="bg-[#FF0000] py-4 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="font-display font-black text-black text-2xl uppercase px-6"
              >
                NORTHERNWEST • PREMIUM PERIPHERALS • CYBERPUNK AESTHETICS •&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-black py-3 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track-reverse">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="font-display font-bold text-[#FF0000] text-xl uppercase px-6"
              >
                GEAR UP • DOMINATE • LEVEL UP YOUR SETUP •&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW ARRIVALS ────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="font-display font-black text-white uppercase tracking-widest text-3xl md:text-4xl mb-12">
          {t('sections.newArrivals')}
        </h2>
        <ProductGrid
          products={newArrivals.slice(0, 4)}
          loading={newLoading}
        />
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────── */}
      <section className="py-24 px-4 red-grid-bg relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2
            className="font-display font-black text-white uppercase text-4xl md:text-6xl mb-4 glitch-text"
            data-text={t('sections.joinGrid')}
          >
            {t('sections.joinGrid')}
          </h2>
          <p className="font-mono text-[#888888] text-sm mb-8">
            {t('sections.joinGridSub')}
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[#FF0000] text-sm uppercase tracking-widest"
            >
              ✓ CONNECTED TO THE GRID
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('sections.emailPlaceholder')}
                required
                className="flex-1 bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none"
              />
              <Button type="submit" variant="primary" loading={subscribing}>
                {t('sections.subscribe')}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
