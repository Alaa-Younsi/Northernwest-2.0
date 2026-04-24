import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { MouseIcon, HeadphonesIcon, KeyboardIcon, CartIcon } from '@/components/icons';

const CATEGORIES = [
  { slug: 'mouse' },
  { slug: 'headphones' },
  { slug: 'keyboards' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  mouse: <MouseIcon size={16} />,
  headphones: <HeadphonesIcon size={16} />,
  keyboards: <KeyboardIcon size={16} />,
};

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);

  // Close nav and cart when route changes
  useEffect(() => {
    setMobileOpen(false);
    closeCart();
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigate
  const handleMobileNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-[70] transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_2px_20px_rgba(255,0,0,0.15)]'
            : ''
        }`}
        style={{
          background: 'rgba(5,5,5,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Northernwest" className="h-8 w-auto" />
            <span className="font-display font-bold text-white uppercase tracking-[0.15em] text-lg hidden sm:block">
              NORTHERNWEST
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-display uppercase tracking-[0.1em] text-sm transition-colors relative py-2 ${
                  isActive ? 'text-[#FF0000]' : 'text-[#888888] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {t('nav.home')}
                  {isActive && (
                    <motion.div
                      layoutId="activeLink"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF0000]"
                    />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `font-display uppercase tracking-[0.1em] text-sm transition-colors relative py-2 ${
                  isActive ? 'text-[#FF0000]' : 'text-[#888888] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {t('nav.shop')}
                  {isActive && (
                    <motion.div
                      layoutId="activeLink"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF0000]"
                    />
                  )}
                </>
              )}
            </NavLink>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdown(true)}
              onMouseLeave={() => setShopDropdown(false)}
            >
              <button className="flex items-center gap-1 font-display uppercase tracking-[0.1em] text-sm text-[#888888] hover:text-white transition-colors py-2">
                {t('nav.categories')}
                <ChevronDown size={14} className={`transition-transform ${shopDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {shopDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-[#0d0d0d] border border-[#1a1a1a] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50"
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 text-[#888888] hover:text-white hover:bg-[#1a1a1a] hover:border-l-2 hover:border-l-[#FF0000] transition-all font-display uppercase tracking-widest text-sm"
                      >
                        <span className="text-[#FF0000]">{CATEGORY_ICONS[cat.slug]}</span>
                        {t(`nav.${cat.slug}`)}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-display uppercase tracking-[0.1em] text-sm transition-colors relative py-2 ${
                  isActive ? 'text-[#FF0000]' : 'text-[#888888] hover:text-white'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Cart */}
            <button
              onClick={() => openCart()}
              className="relative text-[#888888] hover:text-white transition-colors"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF0000] text-black text-xs font-mono font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Admin link (desktop) */}
            <Link
              to="/admin"
              className="hidden lg:block font-mono text-xs text-[#444] hover:text-[#FF0000] transition-colors"
            >
              {t('nav.admin')}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[#888888] hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — always rendered, CSS transitions */}
      <div
        className={`fixed inset-0 bg-black/80 z-[75] transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#050505] border-r border-[#1a1a1a] z-[80] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
          <span className="font-display font-bold text-white uppercase tracking-widest">
            NORTHERNWEST
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-[#888888] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/shop', label: t('nav.shop') },
            { to: '/category/mouse', label: t('nav.mouse') },
            { to: '/category/headphones', label: t('nav.headphones') },
            { to: '/category/keyboards', label: t('nav.keyboards') },
            { to: '/contact', label: 'Contact' },
            { to: '/admin', label: t('nav.admin') },
          ].map((item) => (
            <button
              key={item.to}
              onClick={() => handleMobileNav(item.to)}
              className="block w-full text-left font-display uppercase tracking-widest text-[#888888] hover:text-white transition-colors py-3 border-b border-[#0d0d0d] text-sm"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#1a1a1a]">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
