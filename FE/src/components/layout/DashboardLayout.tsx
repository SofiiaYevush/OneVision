import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
  activeSection?: string;
  basePath?: string;
}

export default function DashboardLayout({ children, navItems, basePath }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentSection = searchParams.get('section') ?? 'overview';
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => null);
    logout();
    navigate('/');
  };

  const isActive = (itemPath: string) => {
    const url = new URL(itemPath, 'http://x');
    const itemSection = url.searchParams.get('section') ?? 'overview';
    if (url.pathname !== location.pathname) return false;
    if (basePath) return itemSection === currentSection;
    return location.pathname === itemPath;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 h-[72px] flex items-center border-b border-gray-50">
          <Link to="/" className="text-xl font-extrabold text-primary tracking-tight">
            Festiv<span className="text-accent">o</span>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                `${user?.firstName?.[0]}${user?.lastName?.[0]}`
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
              <div className="text-[10px] text-gray-300 capitalize mt-0.5">{user?.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</div>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all ${active ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="min-w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">Quick links</div>
          <Link to="/browse" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 mb-0.5 transition-all">
            <span>🔍</span> Browse Performers
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}