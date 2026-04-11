import { Types } from 'mongoose';
import { Availability, IAvailability } from './availability.model';
import { Conflict } from '../../shared/errors';

export async function isDateAvailable(performerId: string, date: Date): Promise<boolean> {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const blocked = await Availability.exists({
    performerId,
    date: { $gte: day, $lt: nextDay },
  });
  return !blocked;
}

export async function blockDate(
  performerId: string,
  date: Date,
  bookingId?: string,
): Promise<void> {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  try {
    await Availability.create({
      performerId,
      date: day,
      type: bookingId ? 'booked' : 'blocked_by_performer',
      ...(bookingId ? { bookingId } : {}),
    });
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e.code === 11000) throw Conflict('Date is already blocked', 'DATE_UNAVAILABLE');
    throw err;
  }
}

export async function unblockDate(performerId: string, date: Date): Promise<void> {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  await Availability.deleteOne({
    performerId,
    date: { $gte: day, $lt: nextDay },
  });
}

export async function unblockByBooking(bookingId: string): Promise<void> {
  await Availability.deleteMany({ bookingId });
}

export async function getMonthAvailability(
  performerId: string,
  year: number,
  month: number,
): Promise<IAvailability[]> {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  return Availability.find({ performerId, date: { $gte: from, $lt: to } });
}

export async function blockManual(performerId: string, dates: string[]): Promise<void> {
  const ops = dates.map((d) => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    return {
      updateOne: {
        filter: { performerId, date: day },
        update: { $setOnInsert: { performerId: new Types.ObjectId(performerId), date: day, type: 'blocked_by_performer' } },
        upsert: true,
      },
    };
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await Availability.bulkWrite(ops as any[]);
}

export async function unblockManual(performerId: string, dates: string[]): Promise<void> {
  const days = dates.map((d) => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    return day;
  });
  await Availability.deleteMany({
    performerId,
    date: { $in: days },
    type: 'blocked_by_performer',
  });
}