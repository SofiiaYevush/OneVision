import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';

const CATEGORIES = [
  { icon: '📸', label: 'Photography', value: 'photography', color: 'bg-violet-100', count: '120+' },
  { icon: '🎵', label: 'Music & DJ', value: 'music', color: 'bg-pink-100', count: '85+' },
  { icon: '🎤', label: 'Event Hosting', value: 'hosting', color: 'bg-blue-100', count: '60+' },
  { icon: '🌸', label: 'Decoration', value: 'decoration', color: 'bg-green-100', count: '95+' },
  { icon: '🎬', label: 'Videography', value: 'videography', color: 'bg-orange-100', count: '45+' },
  { icon: '🎭', label: 'Entertainment', value: 'entertainment', color: 'bg-yellow-100', count: '70+' },
];

const FEATURED = [
  { name: 'Anna Kovalenko', cat: 'Photography', rating: 4.9, reviews: 127, price: 80, icon: '📸', color: 'bg-violet-100' },
  { name: 'DJ Maxim', cat: 'Music & DJ', rating: 4.8, reviews: 94, price: 120, icon: '🎵', color: 'bg-pink-100' },
  { name: 'Sofia Romanova', cat: 'Decoration', rating: 4.9, reviews: 63, price: 50, icon: '🌸', color: 'bg-green-100' },
  { name: 'Alex Marchenko', cat: 'Event Hosting', rating: 4.7, reviews: 82, price: 70, icon: '🎤', color: 'bg-blue-100' },
];

const STEPS = [
  { num: 1, title: 'Search & Browse', desc: 'Explore hundreds of verified performers in your city. Filter by category, price, and rating.' },
  { num: 2, title: 'Review & Book', desc: 'Check portfolios, read reviews, and send a booking request in minutes.' },
  { num: 3, title: 'Enjoy Your Event', desc: 'Confirm details via chat, and enjoy a perfect event with a professional you can trust.' },
];

export default function Landing() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-50 via-pink-50 to-white px-16 py-24 flex items-center gap-20">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-primary text-[13px] font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Trusted by 10,000+ clients
          </div>
          <h1 className="text-[56px] font-extrabold leading-[1.1] tracking-[-1.5px] text-gray-900 mb-5">
            Find the perfect<br /><span className="text-primary">event professional</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-md mb-9">
            Book photographers, DJs, decorators, hosts and more — for any occasion, in any city.
          </p>
          <form onSubmit={handleSearch} className="flex bg-white rounded-2xl shadow-hero overflow-hidden max-w-lg">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search photographers, DJs, decorators..."
              className="flex-1 px-5 py-4 outline-none text-[15px] text-gray-700"
            />
            <button type="submit" className="px-7 py-4 bg-primary text-white text-[15px] font-semibold hover:bg-primary-dark transition-colors">
              Search
            </button>
          </form>
          <div className="flex gap-10 mt-9">
            {[['500+', 'Performers'], ['10k+', 'Events done'], ['4.9', 'Avg. rating']].map(([num, label]) => (
              <div key={label}>
                <div className="text-[28px] font-extrabold text-gray-900">{num}</div>
                <div className="text-[13px] text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-wrap gap-4 justify-center">
          {FEATURED.slice(0, 4).map((p) => (
            <div key={p.name} className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-48 overflow-hidden">
              <div className={`h-36 flex items-center justify-center text-5xl ${p.color}`}>{p.icon}</div>
              <div className="p-3.5">
                <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.cat}</div>
                <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-500">
                  ★ {p.rating} <span className="text-gray-400 font-normal">({p.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-16 py-20">
        <div className="text-center mb-12">
          <div className="text-[13px] font-semibold text-primary uppercase tracking-widest">Browse by category</div>
          <h2 className="text-[38px] font-extrabold text-gray-900 mt-2 tracking-tight">What do you need for your event?</h2>
        </div>
        <div className="flex gap-5 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/browse?category=${cat.value}`}
              className="flex flex-col items-center gap-3.5 p-7 bg-gray-50 rounded-[20px] border-[1.5px] border-gray-100 cursor-pointer w-40 hover:border-primary hover:bg-violet-50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] ${cat.color} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div className="text-sm font-semibold text-gray-700">{cat.label}</div>
              <div className="text-xs text-gray-400">{cat.count} pros</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-16 py-20">
        <div className="text-center mb-12">
          <div className="text-[13px] font-semibold text-primary uppercase tracking-widest">How it works</div>
          <h2 className="text-[38px] font-extrabold text-gray-900 mt-2 tracking-tight">Booking made simple</h2>
        </div>
        <div className="flex gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="flex-1 text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-extrabold mx-auto mb-4">{s.num}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Performers */}
      <section className="px-16 py-20">
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="text-[13px] font-semibold text-primary uppercase tracking-widest">Top rated</div>
            <h2 className="text-[38px] font-extrabold text-gray-900 mt-2 tracking-tight">Featured professionals</h2>
          </div>
          <Link to="/browse" className="btn-outline">View all →</Link>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {FEATURED.map((p) => (
            <Link key={p.name} to="/browse" className="bg-white rounded-[20px] border-[1.5px] border-gray-100 overflow-hidden hover:shadow-card-hover hover:border-violet-200 transition-all cursor-pointer">
              <div className={`h-48 flex items-center justify-center text-6xl ${p.color}`}>{p.icon}</div>
              <div className="p-5">
                <div className="font-bold text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{p.cat}</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    ★ {p.rating} <span className="text-gray-400 font-normal text-xs">({p.reviews})</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">From ${p.price}/hr</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-violet-700 px-16 py-20 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to make your event unforgettable?</h2>
        <p className="text-violet-200 text-lg mb-8">Join 10,000+ clients who found their perfect event professional on Festivo.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/browse" className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-violet-50 transition-colors">Browse performers</Link>
          <Link to="/auth?tab=register" className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30">Sign up free</Link>
        </div>
      </section>

      <footer className="px-16 py-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
        <div className="font-extrabold text-primary text-lg">Festiv<span className="text-accent">o</span></div>
        <div>© 2026 Festivo. All rights reserved.</div>
      </footer>
    </div>
  );
}