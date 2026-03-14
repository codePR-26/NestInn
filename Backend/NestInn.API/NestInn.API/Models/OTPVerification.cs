using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NestInn.API.Models
{
    public class OTPVerification
    {
        [Key]
        public int OTPId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(6)]
        public string OTPCode { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public int Attempts { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}