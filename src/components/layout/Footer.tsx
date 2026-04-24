import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XIcon, InstagramIcon, DiscordIcon } from '@/components/icons';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#050505] border-t border-[#1a1a1a] shadow-[0_-1px_20px_rgba(255,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Northernwest" className="h-8 w-auto" />
              <span className="font-display font-bold text-white uppercase tracking-widest">
                NORTHERNWEST
              </span>
            </div>
            <p className="font-mono text-[#888888] text-xs leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Twitter/X"
                className="w-8 h-8 border border-[#1a1a1a] flex items-center justify-center text-[#888888] hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
              >
                <XIcon size={14} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 border border-[#1a1a1a] flex items-center justify-center text-[#888888] hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="#"
                aria-label="Discord"
                className="w-8 h-8 border border-[#1a1a1a] flex items-center justify-center text-[#888888] hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
              >
                <DiscordIcon size={14} />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-display font-bold uppercase tracking-widest text-white text-sm mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
                { to: '/category/mouse', label: t('nav.mouse') },
                { to: '/category/headphones', label: t('nav.headphones') },
                { to: '/category/keyboards', label: t('nav.keyboards') },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="font-mono text-xs text-[#888888] hover:text-[#FF0000] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Info */}
          <div>
            <h3 className="font-display font-bold uppercase tracking-widest text-white text-sm mb-4">
              {t('footer.info')}
            </h3>
            <ul className="space-y-2">
              {[
                { href: '#', label: t('footer.contact') },
                { href: '#', label: t('footer.privacy') },
                { href: '#', label: t('footer.terms') },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="font-mono text-xs text-[#888888] hover:text-[#FF0000] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a1a1a] pt-6 text-center">
          <p className="font-mono text-xs text-[#888888]">{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
