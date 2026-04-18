import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { notificationsApi } from '@/api/notifications';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import Tooltip from '@/components/ui/Tooltip';
import ReviewModal from '@/components/ReviewModal';
import { bookingClient, bookingPerformer, bookingService, userLabel } from '@/utils/booking';
import type { Booking } from '@/types/api';

const NAV = [
  { icon: '🏠', label: 'Overview', path: '/dashboard' },
  { icon: '📅', label: 'My Bookings', path: '/dashboard?section=bookings' },
  { icon: '💬', label: 'Messages', path: '/dashboard?section=messages' },
  { icon: '🔔', label: 'Notifications', path: '/dashboard?section=notifications' },
  { icon: '👤', label: 'My Profile', path: '/dashboard?section=profile' },
];

function UserCard({ user }: { user: ReturnType<typeof bookingClient> }) {
  if (!user) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <Tooltip content={
      <div>
        <div className="font-semibold">{user.firstName} {user.lastName}</div>
        {user.email && <div className="text-gray-300 mt-0.5">{user.email}</div>}
        {user.city && <div className="text-gray-400 mt-0.5">📍 {user.city}</div>}
      </div>
    }>
      <div className="flex items-center gap-2 cursor-default">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{user.firstName} {user.lastName}</div>
          {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
        </div>
      </div>
    </Tooltip>
  );
}

function BookingsTable({ bookings, onCancel, onReview, cancelPending }: {
  bookings: Booking[];
  onCancel: (id: string) => void;
  onReview: (b: Booking) => void;
  cancelPending: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📅</div>
        <div className="text-sm text-gray-500">No bookings yet</div>
        <Link to="/browse" className="btn-primary mt-4 inline-block">Find a Performer</Link>
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Performer</th>
          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
          <th className="px-5 py-3" />
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => {
          const performer = bookingPerformer(b);
          const service = bookingService(b);
          return (
            <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4">
                <UserCard user={performer} />
                {service && <div className="text-xs text-gray-400 mt-0.5 ml-9">{service.title}</div>}
              </td>
              <td className="px-5 py-4">
                <div className="text-gray-900 font-medium">{b.eventName}</div>
                <div className="text-xs text-gray-400 mt-0.5">📍 {b.eventAddress}</div>
              </td>
              <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                {new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-5 py-4 font-semibold text-gray-900">${b.price}</td>
              <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
              <td className="px-5 py-4">
                <div className="flex gap-2 justify-end">
                  {b.conversationId && (
                    <Tooltip content="Open chat with performer">
                      <Link to={`/bookings/${b.id}`} className="text-xs font-semibold text-primary hover:underline">💬 Chat</Link>
                    </Tooltip>
                  )}
                  {b.status === 'completed' && !b.reviewId && (
                    <Tooltip content="Leave a review for this event">
                      <button onClick={() => onReview(b)} className="text-xs font-semibold text-amber-600 hover:underline">⭐ Review</button>
                    </Tooltip>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <Tooltip content="Cancel this booking">
                      <button
                        onClick={() => onCancel(b.id)}
                        disabled={cancelPending}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </Tooltip>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') ?? 'overview';
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const qc = useQueryClient();

  const bookingsQ = useQuery({
    queryKey: ['client-bookings', statusFilter],
    queryFn: () => bookingsApi.listClient({ limit: 50, status: statusFilter || undefined }),
  });

  const notifQ = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 20 }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-bookings'] }),
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const bookings = bookingsQ.data?.data ?? [];
  const unreadNotifs = (notifQ.data?.data ?? []).filter((n) => !n.isRead).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const navWithBadges = NAV.map((item) => ({
    ...item,
    badge: item.label === 'Notifications' && unreadNotifs > 0 ? unreadNotifs
      : item.label === 'My Bookings' && pendingBookings > 0 ? pendingBookings
      : undefined,
  }));

  return (
    <DashboardLayout navItems={navWithBadges} activeSection={section} basePath="/dashboard">
      <div className="p-8">

        {/* ── OVERVIEW ── */}
        {section === 'overview' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good day, {user?.firstName}! 👋</h1>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              </div>
              <Link to="/browse" className="btn-primary">+ Find a Performer</Link>
            </div>

            <div className="grid grid-cols-4 gap-5 mb-8">
              {[
                { icon: '📅', color: 'bg-violet-100 text-primary', num: bookingsQ.data?.meta?.total ?? 0, label: 'Total bookings' },
                { icon: '✅', color: 'bg-green-100 text-green-700', num: bookings.filter((b) => b.status === 'completed').length, label: 'Completed' },
                { icon: '⏳', color: 'bg-amber-100 text-amber-700', num: bookings.filter((b) => b.status === 'confirmed').length, label: 'Upcoming' },
                { icon: '🔔', color: 'bg-blue-100 text-blue-700', num: unreadNotifs, label: 'Unread notifications' },
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
                  <Link to="/dashboard?section=bookings" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="card overflow-hidden">
                  {bookingsQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : (
                    <BookingsTable
                      bookings={bookings.slice(0, 5)}
                      onCancel={(id) => cancelMut.mutate(id)}
                      onReview={setReviewBooking}
                      cancelPending={cancelMut.isPending}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                  <button onClick={() => notificationsApi.markAllRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))} className="text-xs text-primary hover:underline">Mark all read</button>
                </div>
                <div className="card p-0 overflow-hidden">
                  {notifQ.isLoading ? <div className="flex justify-center py-8"><Spinner /></div>
                    : (notifQ.data?.data ?? []).length === 0
                      ? <div className="text-center py-8 text-sm text-gray-400">No notifications</div>
                      : (notifQ.data?.data ?? []).slice(0, 5).map((n) => (
                        <div key={n.id} className={`flex gap-3 px-5 py-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-violet-50/40' : ''}`} onClick={() => !n.isRead && markReadMut.mutate(n.id)}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-violet-100'}`}>
                            {n.type.includes('confirm') ? '✅' : n.type.includes('message') ? '💬' : n.type.includes('review') ? '⭐' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${n.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>{n.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</div>
                            <div className="text-[10px] text-gray-300 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BOOKINGS ── */}
        {section === 'bookings' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
              <Link to="/browse" className="btn-primary">+ Find a Performer</Link>
            </div>
            <div className="flex gap-2 mb-5">
              {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            <div className="card overflow-hidden">
              {bookingsQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : (
                <BookingsTable
                  bookings={bookings}
                  onCancel={(id) => cancelMut.mutate(id)}
                  onReview={setReviewBooking}
                  cancelPending={cancelMut.isPending}
                />
              )}
            </div>
          </>
        )}

        {/* ── MESSAGES ── */}
        {section === 'messages' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Messages</h1>
            {bookingsQ.isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : (
              <div className="card overflow-hidden">
                {bookings.filter((b) => b.conversationId).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">💬</div>
                    <div className="text-sm text-gray-500">No conversations yet</div>
                    <p className="text-xs text-gray-400 mt-1">Conversations start when you make a booking</p>
                  </div>
                ) : (
                  <div>
                    {bookings.filter((b) => b.conversationId).map((b) => {
                      const performer = bookingPerformer(b);
                      const service = bookingService(b);
                      return (
                        <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                            {performer?.firstName?.[0]}{performer?.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900">{userLabel(performer)}</div>
                            <div className="text-xs text-gray-400 truncate">{service?.title ?? b.eventName}</div>
                            {performer?.email && <div className="text-xs text-gray-300">{performer.email}</div>}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={b.status} />
                            <div className="text-xs text-gray-400">{new Date(b.eventDate).toLocaleDateString()}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
                        {n.type.includes('confirm') ? '✅' : n.type.includes('cancel') ? '🚫' : n.type.includes('message') ? '💬' : n.type.includes('review') ? '⭐' : '🔔'}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
                        <div className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.isRead && (
                        <div className="flex items-start pt-1">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                        </div>
                      )}
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
            <div className="card p-6 max-w-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                    : `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  <div className="text-xs text-gray-400 capitalize mt-0.5 bg-violet-50 text-primary px-2 py-0.5 rounded-full inline-block">{user?.role}</div>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                {[
                  { label: 'First name', value: user?.firstName },
                  { label: 'Last name', value: user?.lastName },
                  { label: 'Email', value: user?.email },
                  { label: 'City', value: user?.city ?? '—' },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400">{f.label}</span>
                    <span className="font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">To edit your profile details, contact support or use the mobile app.</p>
            </div>
          </>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            qc.invalidateQueries({ queryKey: ['client-bookings'] });
          }}
        />
      )}
    </DashboardLayout>
  );
}