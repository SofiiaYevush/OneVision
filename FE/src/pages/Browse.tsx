import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { performersApi } from '@/api/performers';
import type { Category } from '@/types/api';
import Navbar from '@/components/layout/Navbar';
import Spinner from '@/components/ui/Spinner';
import StarRating from '@/components/ui/StarRating';

const CATEGORIES: { icon: string; label: string; value: Category | '' }[] = [
  { icon: '🔍', label: 'All services', value: '' },
  { icon: '📸', label: 'Photography', value: 'photography' },
  { icon: '🎵', label: 'Music & DJ', value: 'music' },
  { icon: '🎤', label: 'Event Hosting', value: 'hosting' },
  { icon: '🌸', label: 'Decoration', value: 'decoration' },
  { icon: '🎬', label: 'Videography', value: 'videography' },
  { icon: '🎭', label: 'Entertainment', value: 'entertainment' },
];

const CITIES = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro'];

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
  photography: '📸',
  music: '🎵',
  hosting: '🎤',
  decoration: '🌸',
  videography: '🎬',
  entertainment: '🎭',
  other: '✨',
};

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxRate, setMaxRate] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);

  const category = (searchParams.get('category') as Category | null) ?? '';
  const city = searchParams.get('city') ?? '';
  const q = searchParams.get('q') ?? '';

  const query = useQuery({
    queryKey: ['performers', { category, city, maxRate, minRating, q, page }],
    queryFn: () => performersApi.browse({
      category: category || undefined,
      city: city || undefined,
      maxRate: maxRate < 500 ? maxRate : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      q: q || undefined,
      page,
      limit: 12,
    }),
  });

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-100 p-6 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="text-sm font-bold text-gray-900 mb-5">Filters</div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search performers..."
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
              className="input-field w-full text-sm"
            />
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setParam('category', c.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === c.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Max price / hr</div>
            <input
              type="range" min={0} max={500} step={10} value={maxRate}
              onChange={(e) => { setMaxRate(+e.target.value); setPage(1); }}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span><span>Up to ${maxRate}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Min rating</div>
            <div className="flex flex-col gap-2">
              {[0, 3, 4, 4.5].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio" name="rating" checked={minRating === r}
                    onChange={() => { setMinRating(r); setPage(1); }}
                    className="accent-primary"
                  />
                  <span className="text-amber-400">{r === 0 ? 'Any' : '★'.repeat(Math.floor(r))}</span>
                  <span className="text-gray-600">{r === 0 ? '' : `${r}+`}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">City</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam('city', '')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${city === '' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
              >
                All
              </button>
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam('city', c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${city === c ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              <strong className="text-gray-900">{query.data?.meta?.total ?? 0} performers</strong> found
              {city ? ` in ${city}` : ''}
            </div>
            <select className="input-field w-48 text-sm">
              <option>Sort by: Top rated</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most reviews</option>
            </select>
          </div>

          {query.isLoading ? (
            <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
          ) : (query.data?.data ?? []).length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-lg font-medium">No performers found</div>
              <div className="text-sm mt-1">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {query.data?.data.map((p) => (
                <Link
                  key={p.id}
                  to={`/performers/${p.id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card-hover hover:border-violet-200 transition-all"
                >
                  <div className={`h-44 flex items-center justify-center text-5xl ${CAT_COLORS[p.category] ?? 'bg-gray-100'}`}>
                    {CAT_ICONS[p.category] ?? '✨'}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{typeof p.userId === 'object' ? `${p.userId.firstName} ${p.userId.lastName}` : ''}</div>
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">{p.category.replace('_', ' ')}</div>
                      </div>
                      <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{p.city}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <StarRating rating={p.averageRating} size="sm" showValue />
                      <div className="text-sm font-semibold text-gray-900">${p.hourlyRate}/hr</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 line-clamp-2">{p.bio}</div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-violet-50 text-primary text-xs rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {query.data?.meta && query.data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: query.data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === p ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-violet-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}