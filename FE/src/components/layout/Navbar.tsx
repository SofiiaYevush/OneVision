import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => null);
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'performer' ? '/performer/dashboard' : user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="flex items-center justify-between px-16 h-[72px] bg-white shadow-[0_1px_0_#e5e7eb] sticky top-0 z-50">
      <Link to="/" className="text-[22px] font-extrabold text-primary tracking-tight">
        Festiv<span className="text-accent">o</span>
      </Link>

      <div className="flex gap-8">
        <Link to="/browse" className="text-sm text-gray-700 font-medium hover:text-primary transition-colors">Browse</Link>
        <Link to="/browse?category=photography" className="text-sm text-gray-700 font-medium hover:text-primary transition-colors">Photography</Link>
        <Link to="/browse?category=music" className="text-sm text-gray-700 font-medium hover:text-primary transition-colors">Music</Link>
        <Link to="/browse?category=decoration" className="text-sm text-gray-700 font-medium hover:text-primary transition-colors">Decoration</Link>
      </div>

      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <Link to={dashboardPath} className="text-sm text-gray-700 font-medium hover:text-primary transition-colors">
              {user.firstName}
            </Link>
            <button onClick={handleLogout} className="btn-outline text-sm">Log out</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="btn-ghost">Log in</Link>
            <Link to="/auth?tab=register" className="btn-primary">Sign up free</Link>
          </>
        )}
      </div>
    </nav>
  );
}