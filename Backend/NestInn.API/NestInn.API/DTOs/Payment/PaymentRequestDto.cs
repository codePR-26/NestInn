using System.ComponentModel.DataAnnotations;
namespace NestInn.API.DTOs.Payment
{
    public class PaymentRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
        public string CardNumber { get; set; } = "4111111111111111";
        public string CardHolder { get; set; } = string.Empty;
        public string Expiry { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
    }
}