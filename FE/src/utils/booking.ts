import type { User, Service, Booking } from '@/types/api';

export function getUser(field: User | string | undefined | null): User | null {
  if (!field || typeof field === 'string') return null;
  return field;
}

export function getService(field: Service | string | undefined | null): Service | null {
  if (!field || typeof field === 'string') return null;
  return field;
}

export function getId(field: User | Service | string | undefined | null): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.id;
}

export function bookingClient(b: Booking): User | null {
  return getUser(b.clientId);
}

export function bookingPerformer(b: Booking): User | null {
  return getUser(b.performerId);
}

export function bookingService(b: Booking): Service | null {
  return getService(b.serviceId);
}

export function userLabel(u: User | null): string {
  if (!u) return 'Unknown';
  return `${u.firstName} ${u.lastName}`;
}