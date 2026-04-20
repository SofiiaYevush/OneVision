import { useState } from 'react';
import { reviewsApi } from '@/api/reviews';
import Spinner from './ui/Spinner';
import type { Booking } from '@/types/api';
import { bookingPerformer } from '@/utils/booking';

interface Props {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ booking, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) { setError('Please write a comment'); return; }
    setLoading(true);
    setError('');
    try {
      await reviewsApi.create(booking.id, rating, comment);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Leave a review</h2>
        <p className="text-sm text-gray-500 mb-6">How was your experience with {bookingPerformer(booking)?.firstName}?</p>

        <div className="flex gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-transform hover:scale-110 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          className="input-field resize-none mb-4"
        />

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading && <Spinner className="w-4 h-4" />}
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}