using System.ComponentModel.DataAnnotations;

namespace NestInn.API.DTOs.Booking
{
    public class CreateBookingDto
    {
        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }
    }
}