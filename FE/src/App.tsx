import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Browse from '@/pages/Browse';
import PerformerProfile from '@/pages/PerformerProfile';
import BookingChat from '@/pages/BookingChat';
import ClientDashboard from '@/pages/ClientDashboard';
import PerformerDashboard from '@/pages/PerformerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Auth />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/performers/:id" element={<PerformerProfile />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/bookings/:id" element={<BookingChat />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="client" />}>
          <Route path="/dashboard" element={<ClientDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="performer" />}>
          <Route path="/performer/dashboard" element={<PerformerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function getDashboard(role: string) {
  if (role === 'performer') return '/performer/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}