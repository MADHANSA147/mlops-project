import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanSearch, TrendingUp, Activity, LogOut, X } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Fake News Detection', icon: ScanSearch, path: '/detection' },
  { label: 'Social Media Trend Analysis', icon: TrendingUp, path: '/trends' },
  { label: 'Model Health', icon: Activity, path: '/model-health' },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('veritas_token');
    navigate('/login');
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200 lg:hidden">
          <span className="font-semibold text-neutral-800">Menu</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path === '/trends' && location.pathname.startsWith('/trends/'));
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`nav-link w-full ${active ? 'nav-link-active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-200">
          <button onClick={handleLogout} className="nav-link w-full text-error-600 hover:bg-error-50 hover:text-error-700">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
