namespace NestInn.API.DTOs.Property
{
    public class PropertyResponseDto
    {
        public int PropertyId { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string CheckInTime { get; set; } = string.Empty;
        public string CheckOutTime { get; set; } = string.Empty;
        public string? NearestTransport { get; set; }
        public string? Rules { get; set; }
        public string? Amenities { get; set; }
        public bool IsAvailable { get; set; }
        public decimal Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Images { get; set; } = new();
    }
}