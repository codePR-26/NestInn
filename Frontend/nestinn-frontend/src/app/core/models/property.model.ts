export interface Property {
  propertyId: number; ownerId: number; ownerName?: string; title: string;
  description?: string; propertyType: string; location: string; city: string;
  pricePerNight: number; checkInTime: string; checkOutTime: string;
  amenities: string; nearestTransport?: string; rules?: string;
  isAvailable: boolean; rating: number; reviewCount?: number; createdAt: string;
  images?: PropertyImage[];
}
export interface PropertyImage { imageId: number; propertyId: number; imageUrl: string; displayOrder: number; }
export interface PropertySearchParams { city?: string; checkIn?: string; checkOut?: string; propertyType?: string; minPrice?: number; maxPrice?: number; }
