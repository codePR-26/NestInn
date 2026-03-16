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
        public decimal PlatformFee { get; set; } 

        [Column(TypeName = "decimal(10,2)")]
        public decimal OwnerAmount { get; set; } 

        public string BookingStatus { get; set; } = "Pending"; 

        public string PaymentStatus { get; set; } = "Pending"; 

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;

        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public Earning? Earning { get; set; }
        public Review? Review { get; set; }
    }
}