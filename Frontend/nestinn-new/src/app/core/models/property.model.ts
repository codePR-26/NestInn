export interface Property {
  propertyId: number; ownerId: number; ownerName?: string; title: string;
  description?: string; propertyType: string; location: string; city: string;
  pricePerNight: number; checkInTime: string; checkOutTime: string;
  amenities: string; nearestTransport?: string; rules?: string;
  isAvailable: boolean; rating: number; createdAt: string;
  images?: string[];
}
export interface PropertySearchParams {
  city?: string; checkInDate?: string; checkOutDate?: string;
  propertyType?: string; minPrice?: number; maxPrice?: number; amenities?: string;
}
