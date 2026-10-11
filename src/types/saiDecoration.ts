/**
 * Sai Decoration Business Hub Data Types & Contracts
 */

export interface SaiCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | 'wedding'
  | 'reception'
  | 'birthday'
  | 'anniversary'
  | 'stage_decoration'
  | 'corporate'
  | 'religious'
  | 'other';

export type BookingStatus =
  | 'inquiry'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface SaiBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  venue: string;
  totalAmountPaise: number;
  advanceReceivedPaise: number;
  balanceDuePaise: number; // total - advance
  status: BookingStatus;
  notes?: string;
  assignedTeam?: string;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface SaiEquipment {
  id: string;
  name: string; // e.g. "Kirloskar 15kVA Generator", "LED Stage Par Lights"
  category: 'generator' | 'lighting' | 'sound' | 'stage_truss' | 'fabric_tent' | 'other';
  serialNumber?: string;
  dailyRatePaise: number;
  status: RentalStatus;
  currentRenter?: string;
  rentedUntil?: string; // YYYY-MM-DD
  fuelCapacityLiters?: number;
  runningHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
}

export interface SaiQuote {
  id: string;
  quoteNumber: string; // e.g. "SD-Q2026-001"
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventType: EventType;
  venue?: string;
  items: QuoteItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number; // GST if applicable
  totalPaise: number;
  validUntil: string; // YYYY-MM-DD
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
