import { BookingStatus, DeliveryType } from './models';

export interface AdminBookingListItem {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  startDate: Date;
  endDate: Date;
  deliveryType: DeliveryType;
  itemCount: number;
  createdAt: Date;
}

export interface AdminBookingDetail {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  customer: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1?: string;
    zip?: string;
    city?: string;
  };
  billingAddressSameAsDelivery?: boolean;
  billingAddress?: {
    nameOrCompany?: string;
    addressLine1?: string;
    zip?: string;
    city?: string;
    country?: string;
  } | null;
  items: {
    id: string;
    resourceId: string;
    resourceName: string;
    quantity: number;
    pricingMode?: "auto" | "individual";
    pricingReason?: string | null;
    calculatedTotalPriceCents?: number | null;
  }[];
  startDate: Date;
  endDate: Date;
  deliveryType: DeliveryType;
  customerMessage?: string;
  notes: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  }[];
  emailLogs: any[];
  calendarSync: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
