export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BookingStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  professionalProfile?: ProfessionalProfile;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  bio: string;
  categoryIds: string[];
  categories?: ServiceCategory[];
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: VerificationStatus;
  serviceRadiusKm: number;
  latitude: number;
  longitude: number;
  address: string;
  isAvailable: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  isEmergencySupported: boolean;
  servicesCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  estimatedDurationMinutes: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customer?: User;
  professionalId: string;
  professional?: {
    id: string;
    user: User;
    hourlyRate: number;
    rating: number;
    latitude: number;
    longitude: number;
    address: string;
  };
  serviceId: string;
  service?: Service;
  status: BookingStatus;
  isEmergency: boolean;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  imageUrl?: string;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName?: string;
  professionalId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  bookingId: string;
  userId: string;
  userName?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  resolutionNotes?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
