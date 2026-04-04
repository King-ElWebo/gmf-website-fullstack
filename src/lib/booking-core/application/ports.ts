import { Booking, BookingStatus, AdminDashboardStats, EmailTemplateType } from '../domain/models';

export interface Paginated<T> {
  data: T[];
  total: number;
}

export interface BookingFilters {
  statuses?: BookingStatus[];
  startDate?: Date;
  endDate?: Date;
  keyword?: string; // name, email or reference
}

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findOverlapping(resourceId: string, start: Date, end: Date, blockingStatuses: BookingStatus[]): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus): Promise<Booking>;
  findForAdminView(filters: BookingFilters, page?: number, limit?: number): Promise<Paginated<any>>;
  getDashboardStats(): Promise<AdminDashboardStats>;
  addNote(bookingId: string, content: string, authorId: string): Promise<any>;
}

export interface CalendarBlockerRepository {
  findOverlapping(resourceId: string, start: Date, end: Date): Promise<Array<{ id: string }>>;
}

export interface EmailProvider {
  sendEmail(to: string, templateType: EmailTemplateType, payload: any): Promise<boolean>;
}

export interface CalendarProvider {
  createEvent(booking: Booking): Promise<string>; 
  updateEvent(eventId: string, booking: Booking): Promise<void>;
  cancelEvent(eventId: string): Promise<void>;
}
