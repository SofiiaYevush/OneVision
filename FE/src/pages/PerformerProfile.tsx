import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { performersApi } from '@/api/performers';
import { reviewsApi } from '@/api/reviews';
import { useAuthStore } from '@/store/auth';
import Navbar from '@/components/layout/Navbar';
import StarRating from '@/components/ui/StarRating';
import Spinner from '@/components/ui/Spinner';
import BookingModal from '@/components/BookingModal';

const CAT_COLORS: Record<string, string> = {
  photography: 'bg-violet-100',
  music: 'bg-pink-100',
  hosting: 'bg-blue-100',
  decoration: 'bg-green-100',
  videography: 'bg-orange-100',
  entertainment: 'bg-yellow-100',
  other: 'bg-gray-100',
};

const CAT_ICONS: Record<string, string> = {
  photography: '📸', music: '🎵', hosting: '🎤',
  decoration: '🌸', videography: '🎬', entertainment: '🎭', other: '✨',
};

type TabKey = 'about' | 'services' | 'portfolio' | 'reviews';

export default function PerformerProfile() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>('about');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const profileQ = useQuery({
    queryKey: ['performer', id],
    queryFn: () => performersApi.getById(id!),
    enabled: !!id,
  });

  const performerUserId = profileQ.data
    ? typeof profileQ.data.userId === 'object'
      ? profileQ.data.userId.id
      : (profileQ.data.userId as string)
    : null;

  const servicesQ = useQuery({
    queryKey: ['performer-services', performerUserId],
    queryFn: () => performersApi.getServices(performerUserId!),
    enabled: !!performerUserId,
  });

  const reviewsQ = useQuery({
    queryKey: ['performer-reviews', id],
    queryFn: () => reviewsApi.listByPerformer(id!, { limit: 10 }),
    enabled: tab === 'reviews' && !!id,
  });

  if (profileQ.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      </div>
    );
  }

  const profile = profileQ.data;
  if (!profile) return null;

  const handleBook = (serviceId: string) => {
    if (!user) { navigate('/auth'); return; }
    setSelectedServiceId(serviceId);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'services', label: 'Services' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'reviews', label: `Reviews (${profile.reviewCount})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/browse" className="text-sm text-gray-500 hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
          ← Back to search results
        </Link>

        <div className="flex gap-6">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Profile header */}
            <div className="card overflow-hidden mb-5">
              <div className={`h-40 ${CAT_COLORS[profile.category] ?? 'bg-gray-100'} relative`}>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="px-3 py-1.5 bg-white/90 text-gray-700 rounded-lg text-xs font-semibold hover:bg-white transition-colors">↑ Share</button>
                  <button className="px-3 py-1.5 bg-white/90 text-gray-700 rounded-lg text-xs font-semibold hover:bg-white transition-colors">♡ Save</button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-5 -mt-12">
                  <div className={`w-20 h-20 rounded-2xl ${CAT_COLORS[profile.category]} border-4 border-white flex items-center justify-center text-3xl flex-shrink-0`}>
                    {typeof profile.userId === 'object' && profile.userId.avatar ? <img src={profile.userId.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : CAT_ICONS[profile.category]}
                  </div>
                  <div className="mt-10 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-gray-900">{typeof profile.userId === 'object' ? profile.userId.firstName : ''} {typeof profile.userId === 'object' ? profile.userId.lastName : ''}</h1>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">✓ Verified</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-primary font-medium capitalize">{profile.category}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">📍 {profile.city}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <StarRating rating={profile.averageRating} size="md" showValue />
                      <span className="text-sm text-gray-400">({profile.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-6 pt-5 border-t border-gray-100">
                  {[
                    { num: profile.reviewCount, label: 'Reviews' },
                    { num: profile.totalBookings, label: 'Events done' },
                    { num: `${profile.experienceYears} yr`, label: 'Experience' },
                    { num: `$${profile.hourlyRate}`, label: 'From / hr' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl font-extrabold text-gray-900">{s.num}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'about' && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">About {typeof profile.userId === 'object' ? profile.userId.firstName : ''}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-violet-50 text-primary text-xs font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Languages</div>
                    <div className="text-sm font-medium text-gray-700">{profile.languages.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Response time</div>
                    <div className="text-sm font-medium text-gray-700">{profile.responseTime}</div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'services' && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Services</h2>
                {servicesQ.isLoading ? <Spinner /> : (
                  <div className="flex flex-col gap-3">
                    {servicesQ.data?.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-violet-200 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="font-semibold text-gray-900 text-sm">{s.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-gray-900">${s.price}</div>
                            <div className="text-xs text-gray-400">{s.priceUnit.replace('_', ' ')}</div>
                          </div>
                          {user?.role === 'client' && (
                            <button onClick={() => handleBook(s.id)} className="btn-primary text-xs px-4 py-2">Book</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'portfolio' && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Portfolio</h2>
                {profile.portfolio.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No portfolio items yet</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {profile.portfolio.map((item) => (
                      <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Reviews</h2>
                {reviewsQ.isLoading ? <Spinner /> : reviewsQ.data?.data.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No reviews yet</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reviewsQ.data?.data.map((r) => {
                      const client = typeof r.clientId === 'object' ? r.clientId : null;
                      const initials = client ? `${client.firstName?.[0] ?? ''}${client.lastName?.[0] ?? ''}` : '?';
                      const name = client ? `${client.firstName} ${client.lastName}` : 'Anonymous';
                      return (
                        <div key={r.id} className="pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                              {client?.avatar
                                ? <img src={client.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                : initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{name}</div>
                                  {client?.email && <div className="text-xs text-gray-400">{client.email}</div>}
                                </div>
                                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                              </div>
                              <StarRating rating={r.rating} size="sm" showValue={false} />
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.comment}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar booking card */}
          <div className="w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="text-lg font-extrabold text-gray-900 mb-1">From ${profile.hourlyRate}<span className="text-sm font-normal text-gray-400">/hr</span></div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-5">
                <StarRating rating={profile.averageRating} size="sm" showValue />
                <span>· {profile.reviewCount} reviews</span>
              </div>

              {user?.role === 'client' ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select a service</div>
                  <div className="flex flex-col gap-2 mb-4">
                    {servicesQ.data?.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${selectedServiceId === s.id ? 'border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">${s.price} · {s.priceUnit.replace('_', ' ')}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!selectedServiceId}
                    onClick={() => selectedServiceId && handleBook(selectedServiceId)}
                    className="btn-primary w-full py-3 text-base disabled:opacity-40"
                  >
                    Request Booking
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn-primary w-full py-3 text-base text-center block">
                  Sign in to book
                </Link>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>🔒</span> You won't be charged yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedServiceId && (
        <BookingModal
          profileId={id!}
          serviceId={selectedServiceId}
          performerName={`${typeof profile.userId === 'object' ? profile.userId.firstName : ''} ${typeof profile.userId === 'object' ? profile.userId.lastName : ''}`}
          serviceName={servicesQ.data?.find((s) => s.id === selectedServiceId)?.title ?? ''}
          servicePrice={servicesQ.data?.find((s) => s.id === selectedServiceId)?.price ?? 0}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </div>
  );
}