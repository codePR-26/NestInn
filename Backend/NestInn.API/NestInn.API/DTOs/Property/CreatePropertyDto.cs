using System.ComponentModel.DataAnnotations;

namespace NestInn.API.DTOs.Property
{
    public class CreatePropertyDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string PropertyType { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public decimal PricePerNight { get; set; }

        [Required]
        public string CheckInTime { get; set; } = string.Empty;

        [Required]
        public string CheckOutTime { get; set; } = string.Empty;

        public string? NearestTransport { get; set; }
        public string? Rules { get; set; }
        public string? Amenities { get; set; }
    }
}