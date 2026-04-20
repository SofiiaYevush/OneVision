import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Spinner from '@/components/ui/Spinner';
import type { User } from '@/types/api';

const NAV = [
  { icon: '📊', label: 'Overview', path: '/admin' },
  { icon: '👥', label: 'Users', path: '/admin/users' },
  { icon: '📅', label: 'Bookings', path: '/admin/bookings' },
  { icon: '🎭', label: 'Performers', path: '/admin/performers' },
  { icon: '🔒', label: 'Moderation', path: '/admin/moderation' },
  { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
];

interface Stats {
  totalUsers?: number;
  totalPerformers?: number;
  totalBookings?: number;
  bookingsByStatus?: Record<string, number>;
  recentUsers?: User[];
}

export default function AdminDashboard() {
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const statsQ = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats() as Promise<Stats>,
  });

  const usersQ = useQuery({
    queryKey: ['admin-users', roleFilter, search],
    queryFn: () => adminApi.listUsers({ role: roleFilter || undefined, search: search || undefined, limit: 20 }),
  });

  const blockMut = useMutation({
    mutationFn: (id: string) => adminApi.blockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const unblockMut = useMutation({
    mutationFn: (id: string) => adminApi.unblockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const stats = statsQ.data;
  const bookings = stats?.bookingsByStatus ?? {};

  return (
    <DashboardLayout navItems={NAV}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { icon: '👥', color: 'bg-violet-100 text-primary', num: stats?.totalUsers ?? '—', label: 'Total users' },
            { icon: '🎭', color: 'bg-pink-100 text-pink-700', num: stats?.totalPerformers ?? '—', label: 'Performers' },
            { icon: '📅', color: 'bg-blue-100 text-blue-700', num: stats?.totalBookings ?? '—', label: 'Total bookings' },
            { icon: '✅', color: 'bg-green-100 text-green-700', num: bookings['confirmed'] ?? '—', label: 'Confirmed bookings' },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.color} mb-3`}>{s.icon}</div>
              <div className="text-2xl font-extrabold text-gray-900">{s.num}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings by status */}
        {Object.keys(bookings).length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Bookings by Status</h2>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(bookings).map(([status, count]) => (
                <div key={status} className="px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-extrabold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-400 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Users</h2>
            <div className="flex gap-3">
              <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by email..."
                  className="input-field w-48 text-sm"
                />
                <button type="submit" className="btn-primary text-sm px-4">Search</button>
              </form>
              <div className="flex gap-2">
                {['', 'client', 'performer', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${roleFilter === r ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {r || 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            {usersQ.isLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : usersQ.data?.data.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400">No users found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersQ.data?.data.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <span className="font-semibold text-gray-900">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`status-badge ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : u.role === 'performer' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`status-badge ${u.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => u.isBlocked ? unblockMut.mutate(u.id) : blockMut.mutate(u.id)}
                            disabled={blockMut.isPending || unblockMut.isPending}
                            className={`text-xs font-semibold hover:underline ${u.isBlocked ? 'text-green-600' : 'text-red-500'}`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}