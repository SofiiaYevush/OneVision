export type UserRole = 'client' | 'performer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type Category = 'photography' | 'music' | 'hosting' | 'decoration' | 'videography' | 'entertainment' | 'other';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  url: string;
  caption?: string;
}

export interface PerformerProfile {
  id: string;
  userId: User | string;
  category: Category;
  bio: string;
  hourlyRate: number;
  city: string;
  tags: string[];
  languages: string[];
  experienceYears: number;
  portfolio: PortfolioItem[];
  averageRating: number;
  reviewCount: number;
  totalBookings: number;
  isActive: boolean;
  responseTime: string;
}

export interface Service {
  id: string;
  performerId: string;
  performerProfileId: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  priceUnit: 'fixed' | 'per_hour' | 'per_day';
  duration?: number;
  location: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending_moderation' | 'rejected';
}

export interface Booking {
  id: string;
  clientId: User | string;
  performerId: User | string;
  serviceId: Service | string;
  performerProfileId: string;
  eventDate: string;
  eventName: string;
  eventType: string;
  eventAddress: string;
  startTime?: string;
  duration?: number;
  guestCount?: number;
  notes?: string;
  price: number;
  status: BookingStatus;
  cancelledBy?: 'client' | 'performer';
  cancelReason?: string;
  conversationId?: string;
  reviewId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'system' | 'booking_update';
  bookingId?: string;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  performerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadClient: number;
  unreadPerformer: number;
  client?: User;
  performer?: User;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  refId?: string;
  refModel?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: User | string;
  performerId: string;
  performerProfileId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiError {
  status: 'error';
  code: string;
  message: string;
}