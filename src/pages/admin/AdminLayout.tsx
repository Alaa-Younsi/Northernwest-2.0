import { useEffect } from 'react';
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: t('admin.products'), icon: Package, end: false },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingBag, end: false },
  ];

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d0d] border-r border-[#1a1a1a]">
        <div className="p-6 border-b border-[#1a1a1a]">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black border border-[#FF0000] flex items-center justify-center">
              <span className="text-[#FF0000] font-display font-black text-sm">NW</span>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm uppercase tracking-widest">
                NORTHERNWEST
              </div>
              <div className="font-mono text-xs text-[#FF0000] uppercase tracking-widest">
                {t('admin.adminPanel')}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-mono text-sm transition-colors ${
                  isActive
                    ? 'text-white bg-[#FF0000]/10 border-l-2 border-[#FF0000]'
                    : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 font-mono text-sm text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors"
          >
            <LogOut size={16} />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] z-50 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-1 font-mono text-xs transition-colors ${
                isActive ? 'text-[#FF0000]' : 'text-[#888888]'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 font-mono text-xs text-[#888888]"
        >
          <LogOut size={20} />
          <span className="text-[10px]">Logout</span>
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
