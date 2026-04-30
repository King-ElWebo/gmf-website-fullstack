import { BookingStatus, DeliveryType, ResourceType } from './config';
export type { BookingStatus, DeliveryType, ResourceType };

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Resource {
  id: string;
  categoryId: string;
  type: ResourceType;
  name: string;
  sku?: string;
  isActive: boolean;
  trackInventory: boolean;
  totalStock: number;               
  bufferTimeBeforeMin: number;      
  bufferTimeAfterMin: number;       
  minDurationMin?: number;
  maxDurationMin?: number;
  metadata?: Record<string, any>;   
}

export interface BookingCustomer {
  id?: string; 
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  zip?: string;
  city?: string;
}

export interface BookingAddress {
  nameOrCompany?: string;
  addressLine1?: string;
  zip?: string;
  city?: string;
  country?: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  resourceId: string;
  quantity: number;
  resourceTitle?: string;
  priceType?: "FIXED" | "FROM_PRICE" | "ON_REQUEST";
  basePriceCents?: number | null;
  priceLabel?: string | null;
  displayPrice?: string | null;
  pricingMode?: "auto" | "individual";
  pricingReason?: string | null;
  bookingDays?: number | null;
  calculatedUnitPriceCents?: number | null;
  calculatedTotalPriceCents?: number | null;
}

export interface Booking {
  id: string;
  referenceCode: string;            
  status: BookingStatus;
  customer: BookingCustomer;
  items: BookingItem[];
  startDate: Date;
  endDate: Date;
  deliveryType: DeliveryType;
  billingAddressSameAsDelivery?: boolean;
  billingAddress?: BookingAddress | null;
  totalPriceCents?: number | null;
  hasIndividualPricing?: boolean;
  customerMessage?: string;
  internalNotes?: InternalNote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalNote {
  id: string;
  bookingId: string;
  authorId: string; 
  content: string;
  createdAt: Date;
}

export interface AdminDashboardStats {
  openRequestsCount: number;
  upcomingApprovedBookingsCount: number; 
  conflictedBookingsCount: number;
  resourcesWithLowStockCount: number;
  failedEmailsCount: number;
  failedCalendarSyncsCount: number;
}

export interface BookingConflict {
  bookingId: string;
  resourceIds: string[];
  reason: 'oversold' | 'buffer_overlap' | 'maintenance' | 'status_collision';
  severity: 'warning' | 'critical';
}

export interface BookingTimelineEntry {
  id: string;
  bookingId: string;
  action: string; 
  oldValue?: string;
  newValue?: string;
  actorId?: string; 
  createdAt: Date;
}

export type EmailDeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';
export type EmailTemplateType = 'booking.requested.admin' | 'booking.approved.customer' | 'booking.rejected.customer' | 'booking.cancelled.customer';

export interface EmailLog {
  id: string;
  bookingId: string;
  templateType: EmailTemplateType;
  status: EmailDeliveryStatus;
  recipientEmail: string;
  errorText?: string;
  retryCount: number;
  lastAttemptAt: Date;
}

export type CalendarSyncStatus = 'pending' | 'synced' | 'failed';

export interface CalendarSyncRecord {
  id: string;
  bookingId: string;
  externalEventId?: string;
  syncStatus: CalendarSyncStatus;
  lastSyncedAt?: Date;
  syncError?: string;
}
