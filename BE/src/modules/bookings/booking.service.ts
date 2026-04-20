import { Booking, IBooking, BookingStatus } from './booking.model';
import { Service } from '../services/service.model';
import { PerformerProfile } from '../performers/performer.model';
import { CreateBookingDto, CancelBookingDto, BookingQueryDto } from './booking.dto';
import { isDateAvailable, blockDate, unblockByBooking } from '../availability/availability.service';
import { bus, Events } from '../../shared/events/bus';
import { NotFound, Forbidden, Conflict, BadRequest } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';

export interface BookingEventPayload {
  booking: IBooking;
  actorId: string;
}

export async function createBooking(clientId: string, dto: CreateBookingDto): Promise<IBooking> {
  const service = await Service.findById(dto.serviceId);
  if (!service || service.status !== 'active') throw NotFound('Service not found');

  const profile = await PerformerProfile.findById(service.performerProfileId);
  if (!profile) throw NotFound('Performer profile not found');

  if (service.performerId.toString() === clientId) {
    throw BadRequest('Cannot book your own service');
  }

  const available = await isDateAvailable(service.performerId.toString(), dto.eventDate);
  if (!available) throw Conflict('Selected date is not available', 'DATE_UNAVAILABLE');

  const booking = await Booking.create({
    clientId,
    performerId: service.performerId,
    serviceId: service._id,
    performerProfileId: service.performerProfileId,
    eventDate: dto.eventDate,
    eventName: dto.eventName,
    eventType: dto.eventType,
    eventAddress: dto.eventAddress,
    startTime: dto.startTime,
    duration: dto.duration,
    guestCount: dto.guestCount,
    notes: dto.notes,
    price: service.price,
    status: 'pending',
  });

  bus.emit<BookingEventPayload>(Events.BOOKING_CREATED, { booking, actorId: clientId });
  return booking;
}

export async function getBooking(id: string, userId: string): Promise<IBooking> {
  const booking = await Booking.findById(id)
    .populate('clientId', 'firstName lastName avatar email')
    .populate('performerId', 'firstName lastName avatar email')
    .populate('serviceId', 'title description price priceUnit');
  if (!booking) throw NotFound('Booking not found');

  const clientIdStr = (booking.clientId as unknown as { id?: string; _id?: { toString(): string } }).id
    ?? (booking.clientId as unknown as { _id?: { toString(): string } })._id?.toString()
    ?? booking.clientId.toString();
  const performerIdStr = (booking.performerId as unknown as { id?: string; _id?: { toString(): string } }).id
    ?? (booking.performerId as unknown as { _id?: { toString(): string } })._id?.toString()
    ?? booking.performerId.toString();
  const isParty = clientIdStr === userId || performerIdStr === userId;
  if (!isParty) throw Forbidden();
  return booking;
}

export async function getClientBookings(clientId: string, query: BookingQueryDto) {
  const filter: Record<string, unknown> = { clientId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('performerId', 'firstName lastName avatar')
      .populate('serviceId', 'title'),
    Booking.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, query.page, query.limit) };
}

export async function getPerformerBookings(performerId: string, query: BookingQueryDto) {
  const filter: Record<string, unknown> = { performerId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(query.limit)
      .populate('clientId', 'firstName lastName avatar')
      .populate('serviceId', 'title price'),
    Booking.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, query.page, query.limit) };
}

async function assertStatus(booking: IBooking, allowed: BookingStatus[]) {
  if (!allowed.includes(booking.status)) {
    throw BadRequest(`Cannot perform this action on a ${booking.status} booking`);
  }
}

export async function confirmBooking(bookingId: string, performerId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw NotFound('Booking not found');
  if (booking.performerId.toString() !== performerId) throw Forbidden();
  await assertStatus(booking, ['pending']);

  const available = await isDateAvailable(performerId, booking.eventDate);
  if (!available) throw Conflict('Date is no longer available', 'DATE_UNAVAILABLE');

  booking.status = 'confirmed';
  await booking.save();

  await blockDate(performerId, booking.eventDate, booking.id);

  bus.emit<BookingEventPayload>(Events.BOOKING_CONFIRMED, { booking, actorId: performerId });
  return booking;
}

export async function rejectBooking(bookingId: string, performerId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw NotFound('Booking not found');
  if (booking.performerId.toString() !== performerId) throw Forbidden();
  await assertStatus(booking, ['pending']);

  booking.status = 'rejected';
  await booking.save();

  bus.emit<BookingEventPayload>(Events.BOOKING_REJECTED, { booking, actorId: performerId });
  return booking;
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  dto: CancelBookingDto,
): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw NotFound('Booking not found');

  const isClient = booking.clientId.toString() === userId;
  const isPerformer = booking.performerId.toString() === userId;
  if (!isClient && !isPerformer) throw Forbidden();
  await assertStatus(booking, ['pending', 'confirmed']);

  const wasConfirmed = booking.status === 'confirmed';
  booking.status = 'cancelled';
  booking.cancelledBy = isClient ? 'client' : 'performer';
  booking.cancelReason = dto.reason;
  await booking.save();

  if (wasConfirmed) {
    await unblockByBooking(booking.id);
  }

  bus.emit<BookingEventPayload>(Events.BOOKING_CANCELLED, { booking, actorId: userId });
  return booking;
}

export async function completeBooking(bookingId: string, performerId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw NotFound('Booking not found');
  if (booking.performerId.toString() !== performerId) throw Forbidden();
  await assertStatus(booking, ['confirmed']);

  booking.status = 'completed';
  await booking.save();

  bus.emit<BookingEventPayload>(Events.BOOKING_COMPLETED, { booking, actorId: performerId });
  return booking;
}