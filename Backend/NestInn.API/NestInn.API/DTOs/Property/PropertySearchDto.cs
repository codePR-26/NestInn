namespace NestInn.API.DTOs.Property
{
    public class PropertySearchDto
    {
        public string? City { get; set; }
        public string? PropertyType { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public string? Amenities { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}