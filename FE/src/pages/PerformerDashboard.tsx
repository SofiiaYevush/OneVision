import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { performersApi } from '@/api/performers';
import { notificationsApi } from '@/api/notifications';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import Tooltip from '@/components/ui/Tooltip';
import { bookingClient, bookingService, userLabel } from '@/utils/booking';
import type { Booking } from '@/types/api';

const NAV = [
  { icon: '🏠', label: 'Overview', path: '/performer/dashboard' },
  { icon: '📅', label: 'Bookings', path: '/performer/dashboard?section=bookings' },
  { icon: '💬', label: 'Messages', path: '/performer/dashboard?section=messages' },
  { icon: '🔔', label: 'Notifications', path: '/performer/dashboard?section=notifications' },
  { icon: '👤', label: 'My Profile', path: '/performer/dashboard?section=profile' },
];

function ClientCell({ booking }: { booking: Booking }) {
  const client = bookingClient(booking);
  if (!client) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <Tooltip content={
      <div>
        <div className="font-semibold">{client.firstName} {client.lastName}</div>
        {client.email && <div className="text-gray-300 mt-0.5">{client.email}</div>}
        {client.city && <div className="text-gray-400 mt-0.5">📍 {client.city}</div>}
      </div>
    }>
      <div className="flex items-center gap-2 cursor-default">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
          {client.firstName?.[0]}{client.lastName?.[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{client.firstName} {client.lastName}</div>
          {client.email && <div className="text-xs text-gray-400">{client.email}</div>}
        </div>
      </div>
    </Tooltip>
  );
}

export default function PerformerDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') ?? 'overview';
  const qc = useQueryClient();

  const bookingsQ = useQuery({
    queryKey: ['performer-bookings'],
    queryFn: () => bookingsApi.listPerformer({ limit: 50 }),
  });

  const profileQ = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => performersApi.getMyProfile(),
  });

  const notifQ = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 20 }),
  });

  const confirmMut = useMutation({
    mutationFn: (id: string) => bookingsApi.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performer-bookings'] }),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => bookingsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performer-bookings'] }),
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const bookings = bookingsQ.data?.data ?? [];
  const pending = bookings.filter((b) => b.status === 'pending');
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const unreadNotifs = (notifQ.data?.data ?? []).filter((n) => !n.isRead).length;

  const navWithBadges = NAV.map((item) => ({
    ...item,
    badge: item.label === 'Notifications' && unreadNotifs > 0 ? unreadNotifs
      : item.label === 'Bookings' && pending.length > 0 ? pending.length
      : undefined,
  }));

  const BookingRow = ({ b }: { b: Booking }) => {
    const service = bookingService(b);
    return (
      <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
        <td className="px-5 py-4"><ClientCell booking={b} /></td>
        <td className="px-5 py-4">
          <div className="text-gray-900 font-medium">{b.eventName}</div>
          <div className="text-xs text-gray-400">{b.eventType}</div>
        </td>
        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
          {new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-5 py-4">
          <div className="font-semibold text-gray-900">${b.price}</div>
          {service && <div className="text-xs text-gray-400">{service.title}</div>}
        </td>
        <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
        <td className="px-5 py-4">
          <div className="flex gap-2 justify-end">
            {b.status === 'pending' && (
              <>
                <Tooltip content="Reject this booking request">
                  <button onClick={() => rejectMut.mutate(b.id)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">Reject</button>
                </Tooltip>
                <Tooltip content="Confirm and block this date in your calendar">
                  <button onClick={() => confirmMut.mutate(b.id)} disabled={confirmMut.isPending} className="text-xs font-semibold text-green-600 hover:underline">
                    ✅ Confirm
                  </button>
                </Tooltip>
              </>
            )}
            {b.conversationId && (
              <Tooltip content="Open chat with client">
                <Link to={`/bookings/${b.id}`} className="text-xs font-semibold text-primary hover:underline">💬 Chat</Link>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <DashboardLayout navItems={navWithBadges} basePath="/performer/dashboard">
      <div className="p-8">

        {/* ── OVERVIEW ── */}
        {section === 'overview' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}! 🎭</h1>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              </div>
              <Link to="/browse" className="btn-outline">View My Public Profile</Link>
            </div>

            {pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-800">
                    {pending.length} pending booking request{pending.length > 1 ? 's' : ''} waiting for your response
                  </div>
                  <div className="text-xs text-amber-600 mt-0.5">Respond within 24 hours to maintain your response rate</div>
                </div>
                <Link to="/performer/dashboard?section=bookings" className="text-xs font-semibold text-amber-700 hover:underline">Review →</Link>
              </div>
            )}

            <div className="grid grid-cols-4 gap-5 mb-8">
              {[
                { icon: '⏳', color: 'bg-amber-100 text-amber-700', num: pending.length, label: 'Pending requests' },
                { icon: '✅', color: 'bg-green-100 text-green-700', num: confirmed.length, label: 'Confirmed' },
                { icon: '🎉', color: 'bg-blue-100 text-blue-700', num: completed.length, label: 'Completed' },
                { icon: '⭐', color: 'bg-violet-100 text-primary', num: profileQ.data?.averageRating.toFixed(1) ?? '—', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="card p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.color} mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-extrabold text-gray-900">{s.num}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[1fr_360px] gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
                  <Link to="/performer/dashboard?section=bookings" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="card overflow-hidden">
                  {bookingsQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div>
                    : bookings.length === 0
                      ? <div className="text-center py-10 text-sm text-gray-400">No bookings yet</div>
                      : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                              <th className="px-5 py-3" />
                            </tr>
                          </thead>
                          <tbody>{bookings.slice(0, 5).map((b) => <BookingRow key={b.id} b={b} />)}</tbody>
                        </table>
                      )
                  }
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {profileQ.data && (
                  <div className="card p-5">
                    <div className="text-sm font-bold text-gray-900 mb-3">Profile Stats</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Reviews', val: profileQ.data.reviewCount },
                        { label: 'Rating', val: profileQ.data.averageRating.toFixed(1) },
                        { label: 'Events', val: profileQ.data.totalBookings },
                        { label: 'Rate', val: `$${profileQ.data.hourlyRate}/hr` },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-lg font-extrabold text-gray-900">{s.val}</div>
                          <div className="text-xs text-gray-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-gray-900">Notifications</div>
                    <Link to="/performer/dashboard?section=notifications" className="text-xs text-primary hover:underline">View all</Link>
                  </div>
                  <div className="card overflow-hidden">
                    {notifQ.isLoading ? <div className="flex justify-center py-6"><Spinner /></div>
                      : (notifQ.data?.data ?? []).length === 0
                        ? <div className="text-center py-6 text-xs text-gray-400">No notifications</div>
                        : (notifQ.data?.data ?? []).slice(0, 4).map((n) => (
                          <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-violet-50/40' : ''}`}>
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs flex-shrink-0">
                              {n.type.includes('created') ? '📋' : n.type.includes('cancel') ? '🚫' : '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.body}</div>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />}
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BOOKINGS ── */}
        {section === 'bookings' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Bookings</h1>
            <div className="card overflow-hidden">
              {bookingsQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div>
                : bookings.length === 0
                  ? <div className="text-center py-10 text-sm text-gray-400">No bookings yet</div>
                  : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>{bookings.map((b) => <BookingRow key={b.id} b={b} />)}</tbody>
                    </table>
                  )
              }
            </div>
          </>
        )}

        {/* ── MESSAGES ── */}
        {section === 'messages' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Messages</h1>
            <div className="card overflow-hidden">
              {bookings.filter((b) => b.conversationId).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="text-sm text-gray-500">No conversations yet</div>
                </div>
              ) : (
                bookings.filter((b) => b.conversationId).map((b) => {
                  const client = bookingClient(b);
                  return (
                    <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                        {client?.firstName?.[0]}{client?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{userLabel(client)}</div>
                        <div className="text-xs text-gray-400">{b.eventName}</div>
                        {client?.email && <div className="text-xs text-gray-300">{client.email}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={b.status} />
                        <div className="text-xs text-gray-400">{new Date(b.eventDate).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === 'notifications' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <button onClick={() => notificationsApi.markAllRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))} className="text-sm text-primary hover:underline">Mark all read</button>
            </div>
            <div className="card p-0 overflow-hidden">
              {notifQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div>
                : (notifQ.data?.data ?? []).length === 0
                  ? <div className="text-center py-12 text-sm text-gray-400">No notifications</div>
                  : (notifQ.data?.data ?? []).map((n) => (
                    <div key={n.id} className={`flex gap-4 px-6 py-5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-violet-50/40' : ''}`} onClick={() => !n.isRead && markReadMut.mutate(n.id)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-violet-100'}`}>
                        {n.type.includes('confirm') ? '✅' : n.type.includes('cancel') ? '🚫' : n.type.includes('message') ? '💬' : '🔔'}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
                        <div className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.isRead && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  ))
              }
            </div>
          </>
        )}

        {/* ── PROFILE ── */}
        {section === 'profile' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>
            <div className="grid grid-cols-[1fr_320px] gap-6">
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl font-bold text-primary">
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    <span className="text-xs bg-violet-50 text-primary px-2 py-0.5 rounded-full capitalize inline-block mt-1">{user?.role}</span>
                  </div>
                </div>
                {profileQ.data && (
                  <div className="grid gap-3 text-sm pt-4 border-t border-gray-100">
                    {[
                      { label: 'Category', value: profileQ.data.category },
                      { label: 'City', value: profileQ.data.city },
                      { label: 'Hourly rate', value: `$${profileQ.data.hourlyRate}/hr` },
                      { label: 'Experience', value: `${profileQ.data.experienceYears} years` },
                      { label: 'Languages', value: profileQ.data.languages.join(', ') },
                      { label: 'Response time', value: profileQ.data.responseTime ?? '—' },
                    ].map((f) => (
                      <div key={f.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-400">{f.label}</span>
                        <span className="font-medium text-gray-900 capitalize">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {profileQ.data && (
                <div className="card p-5">
                  <div className="text-sm font-bold text-gray-900 mb-4">Stats</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Reviews', val: profileQ.data.reviewCount },
                      { label: 'Rating', val: profileQ.data.averageRating.toFixed(1) },
                      { label: 'Events', val: profileQ.data.totalBookings },
                      { label: 'Tags', val: profileQ.data.tags.length },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xl font-extrabold text-gray-900">{s.val}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {profileQ.data.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-violet-50 text-primary text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}