import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bookingsApi } from '@/api/bookings';
import Spinner from './ui/Spinner';

const schema = z.object({
  eventName: z.string().min(2, 'Min 2 characters'),
  eventType: z.string().min(2, 'Required'),
  eventAddress: z.string().min(5, 'Min 5 characters'),
  eventDate: z.string().min(1, 'Required'),
  guestCount: z.coerce.number().int().min(1).optional(),
  notes: z.string().max(2000).optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  profileId: string;
  serviceId: string;
  performerName: string;
  serviceName: string;
  servicePrice: number;
  onClose: () => void;
}

export default function BookingModal({ serviceId, performerName, serviceName, servicePrice, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError('');
    try {
      const booking = await bookingsApi.create({
        serviceId,
        eventDate: new Date(data.eventDate).toISOString(),
        eventName: data.eventName,
        eventType: data.eventType,
        eventAddress: data.eventAddress,
        guestCount: data.guestCount,
        notes: data.notes,
      });
      setBookingId(booking.id);
      setStep(3);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Failed to create booking');
    }
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Steps header */}
        <div className="flex items-center px-8 py-5 border-b border-gray-100">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              <div className="ml-2">
                <div className={`text-xs font-semibold ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {['Select service', 'Event details', 'Confirm'][i]}
                </div>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-4 ${step > s ? 'bg-green-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <div className="p-8">
          {/* Booking summary */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📸</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">{performerName}</div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{serviceName}</div>
            </div>
            <div className="text-lg font-extrabold text-gray-900 flex-shrink-0">${servicePrice}</div>
          </div>

          {step === 1 && (
            <div>
              <p className="text-sm text-gray-600 mb-6">Service selected. Continue to fill in your event details.</p>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3">Continue to Event Details →</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event name</label>
                <input {...register('eventName')} placeholder="e.g. Wedding Ceremony" className="input-field" />
                {formState.errors.eventName && <p className="text-xs text-red-500 mt-1">{formState.errors.eventName.message}</p>}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event type</label>
                  <select {...register('eventType')} className="input-field">
                    <option value="">Select type</option>
                    {['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Graduation', 'Other'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {formState.errors.eventType && <p className="text-xs text-red-500 mt-1">{formState.errors.eventType.message}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input {...register('eventDate')} type="date" min={today} className="input-field" />
                  {formState.errors.eventDate && <p className="text-xs text-red-500 mt-1">{formState.errors.eventDate.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue address</label>
                <input {...register('eventAddress')} placeholder="Venue name, City" className="input-field" />
                {formState.errors.eventAddress && <p className="text-xs text-red-500 mt-1">{formState.errors.eventAddress.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guest count (optional)</label>
                <input {...register('guestCount')} type="number" min={1} placeholder="Approx. number of guests" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea {...register('notes')} rows={3} placeholder="Any special requirements..." className="input-field resize-none" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                <button type="submit" disabled={formState.isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formState.isSubmitting && <Spinner className="w-4 h-4" />}
                  Send Request
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking request sent!</h3>
              <p className="text-sm text-gray-500 mb-6">{performerName} will respond soon. You'll get notified by email and in-app.</p>
              {bookingId && (
                <div className="text-xs text-gray-400 mb-6">Booking ID: <strong className="text-gray-700">#{bookingId.slice(-8).toUpperCase()}</strong></div>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={onClose} className="btn-outline">Close</button>
                {bookingId && (
                  <button onClick={() => navigate(`/bookings/${bookingId}`)} className="btn-primary">💬 Open Chat</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}