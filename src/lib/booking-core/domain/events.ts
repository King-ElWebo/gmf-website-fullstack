import { Booking, BookingStatus } from './models';

// Interne Domain Events zur losen Kopplung.
// Abhängig von der Architektur können diese z.B. über EventEmitter oder MessageBroker verteilt werden.

export interface DomainEvent {
  eventName: string;
  timestamp: Date;
}

export interface BookingStatusChangedEvent extends DomainEvent {
  eventName: 'booking.status_changed';
  bookingId: string;
  oldStatus: BookingStatus | null;
  newStatus: BookingStatus;
  actorId?: string; // Wer hat geändert (Admin vs System/User)
}

export interface BookingRequestedEvent extends DomainEvent {
  eventName: 'booking.requested';
  booking: Booking;
}

export interface BookingApprovedEvent extends DomainEvent {
  eventName: 'booking.approved';
  booking: Booking;
}

export interface BookingCancelledEvent extends DomainEvent {
  eventName: 'booking.cancelled';
  booking: Booking;
  reason?: string;
}
