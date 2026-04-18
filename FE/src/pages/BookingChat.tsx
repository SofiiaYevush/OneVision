import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { chatApi } from '@/api/chat';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';
import Navbar from '@/components/layout/Navbar';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import type { Message } from '@/types/api';
import { bookingClient, bookingPerformer, bookingService, getId } from '@/utils/booking';

export default function BookingChat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const socket = useSocket();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const bookingQ = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });

  const booking = bookingQ.data;
  const convId = booking?.conversationId;

  const messagesQ = useQuery({
    queryKey: ['messages', convId],
    queryFn: () => chatApi.getMessages(convId!, { limit: 50 }),
    enabled: !!convId,
  });

  useEffect(() => {
    if (messagesQ.data?.data) {
      setMessages([...messagesQ.data.data].reverse());
    }
  }, [messagesQ.data]);

  useEffect(() => {
    if (!socket || !convId) return;
    socket.emit('chat:join', convId);

    const handler = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('message:new', handler);

    return () => {
      socket.off('message:new', handler);
      socket.emit('chat:leave', convId);
    };
  }, [socket, convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMut = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(convId!, content),
    onSuccess: (msg) => {
      setMessages((prev) => [...prev, msg]);
      setInput('');
    },
  });

  const confirmMut = useMutation({
    mutationFn: () => bookingsApi.confirm(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  const rejectMut = useMutation({
    mutationFn: () => bookingsApi.reject(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  const cancelMut = useMutation({
    mutationFn: () => bookingsApi.cancel(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  const completeMut = useMutation({
    mutationFn: () => bookingsApi.complete(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || !convId) return;
    sendMut.mutate(text);
  };

  const isPerformer = !!booking && user?.id === getId(booking.performerId);
  const isClient = !!booking && user?.id === getId(booking.clientId);

  if (bookingQ.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      </div>
    );
  }

  if (!booking) return null;

  const performer = bookingPerformer(booking);
  const client = bookingClient(booking);
  const service = bookingService(booking);
  const otherUser = isPerformer ? client : performer;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 flex gap-6">
        {/* Booking details */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Booking Details</h2>
              <StatusBadge status={booking.status} />
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📸</div>
              <div>
                <div className="font-semibold text-gray-900">{performer?.firstName} {performer?.lastName}</div>
                {performer?.email && <div className="text-xs text-gray-400">{performer.email}</div>}
                <div className="text-xs text-gray-500">{service?.title ?? 'Service'}</div>
              </div>
              <div className="ml-auto text-xl font-extrabold text-gray-900">${booking.price}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>📅</span> {new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>🎉</span> {booking.eventName}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>📍</span> {booking.eventAddress}
              </div>
              {booking.guestCount && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>👥</span> {booking.guestCount} guests
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 mb-1">Notes</div>
                <p className="text-sm text-gray-600">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {booking.status === 'pending' && isPerformer && (
            <div className="card p-5 flex gap-3">
              <button onClick={() => rejectMut.mutate()} disabled={rejectMut.isPending} className="btn-outline flex-1">
                Reject
              </button>
              <button onClick={() => confirmMut.mutate()} disabled={confirmMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {confirmMut.isPending && <Spinner className="w-4 h-4" />}
                ✅ Confirm Booking
              </button>
            </div>
          )}

          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="card p-4 flex justify-end">
              <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending} className="text-sm font-medium text-red-500 hover:underline">
                Cancel booking
              </button>
            </div>
          )}

          {booking.status === 'confirmed' && isPerformer && (
            <div className="card p-4 flex justify-end">
              <button onClick={() => completeMut.mutate()} disabled={completeMut.isPending} className="btn-primary">
                Mark as Completed
              </button>
            </div>
          )}

          {booking.status === 'completed' && !booking.reviewId && isClient && (
            <div className="card p-5 text-center bg-amber-50 border border-amber-100">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-semibold text-gray-900 mb-1">How was your event?</div>
              <Link to="/dashboard" className="text-sm text-primary hover:underline">Leave a review on your dashboard</Link>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="w-96 flex-shrink-0 card flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
              {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{otherUser?.firstName} {otherUser?.lastName}</div>
              {otherUser?.email && <div className="text-xs text-gray-400">{otherUser.email}</div>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {messagesQ.isLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isSystem = msg.type === 'system' || msg.senderId === '000000000000000000000000';
                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.content}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                      {msg.content}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMut.isPending}
              className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center text-base hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}