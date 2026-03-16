using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NestInn.API.Models
{
    public class Earning
    {
        [Key]
        public int EarningId { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

        public bool IsWithdrawn { get; set; } = false;

        public DateTime? WithdrawnAt { get; set; }

        [ForeignKey("BookingId")]
        public Booking Booking { get; set; } = null!;
    }
}