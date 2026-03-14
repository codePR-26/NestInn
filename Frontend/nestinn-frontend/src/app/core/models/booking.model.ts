export interface Booking {
  bookingId: number; userId: number; propertyId: number;
  propertyTitle?: string; propertyCity?: string; propertyImage?: string; ownerName?: string;
  checkInDate: string; checkOutDate: string; totalNights: number;
  totalAmount: number; platformFee: number; ownerAmount: number;
  bookingStatus: 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded' | 'Failed'; bookedAt: string;
}
export interface BookingRequest { propertyId: number; checkInDate: string; checkOutDate: string; }
