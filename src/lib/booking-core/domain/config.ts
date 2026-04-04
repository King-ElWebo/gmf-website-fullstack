export type BookingStatus = 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
export type DeliveryType = 'pickup' | 'delivery' | 'shipping' | 'digital' | 'onsite';
export type ResourceType = 'rental' | 'service' | 'space' | 'equipment';

export interface BookingModuleConfig {
  blockingStatuses: BookingStatus[];
  requiresApproval: boolean;
  trackInventoryGlobally: boolean;
  useTimeSlots: boolean;
  allowMultipleItemsPerBooking: boolean;
  features: {
    calendarSync: boolean;
    emailNotifications: boolean;
    deliveryManagement: boolean;
  };
}
