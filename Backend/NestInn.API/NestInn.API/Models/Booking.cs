using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NestInn.API.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        [Required]
        public int TotalNights { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PlatformFee { get; set; } // 10%

        [Column(TypeName = "decimal(10,2)")]
        public decimal OwnerAmount { get; set; } // 90%

        public string BookingStatus { get; set; } = "Pending"; // Pending, Confirmed, Declined, Cancelled

        public string PaymentStatus { get; set; } = "Pending"; // Pending, Success, Failed, Refunded

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;

        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public Earning? Earning { get; set; }
        public Review? Review { get; set; }
    }
}