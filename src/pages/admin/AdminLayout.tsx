import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tag, Settings2, Store, MessageSquare, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package, end: false },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, end: false },
    { to: '/admin/categories', label: 'Categories', icon: Tag, end: false },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare, end: false },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Mail, end: false },
    { to: '/admin/settings', label: 'Settings', icon: Settings2, end: false },
  ];

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar — icon-only on sm/md, full on lg */}
      <aside className="flex flex-col bg-[#0d0d0d] border-r border-[#1a1a1a] w-12 lg:w-64 flex-shrink-0">
        {/* Logo area */}
        <div className="border-b border-[#1a1a1a]">
          {/* Desktop: full logo + clock */}
          <div className="hidden lg:block p-6">
            <Link to="/admin" className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="NW" className="h-8 w-auto" />
              <div>
                <div className="font-display font-bold text-white text-sm uppercase tracking-widest">
                  NORTHERNWEST
                </div>
                <div className="font-mono text-xs text-[#FF0000] uppercase tracking-widest">
                  Admin Panel
                </div>
              </div>
            </Link>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#444]">{clock}</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
          {/* Mobile: just icon */}
          <div className="lg:hidden flex justify-center py-3">
            <Link to="/admin">
              <img src="/logo.png" alt="NW" className="h-5 w-auto" />
            </Link>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 lg:p-4 lg:space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-4 py-3 font-mono text-sm transition-colors ${
                  isActive
                    ? 'text-white bg-[#FF0000]/10 border-l-2 border-[#FF0000]'
                    : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
              title={item.label}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[#1a1a1a] py-2 lg:p-4 lg:space-y-1">
          <Link
            to="/"
            title="Back to Store"
            className="flex items-center justify-center lg:justify-start gap-3 w-full px-0 lg:px-4 py-3 font-mono text-sm text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <Store size={16} className="flex-shrink-0" />
            <span className="hidden lg:block">Back to Store</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center justify-center lg:justify-start gap-3 w-full px-0 lg:px-4 py-3 font-mono text-sm text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
