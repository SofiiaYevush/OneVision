import clsx from 'clsx';
import type { BookingStatus } from '@/types/api';

const LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-50 text-blue-700',
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={clsx('status-badge', STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}