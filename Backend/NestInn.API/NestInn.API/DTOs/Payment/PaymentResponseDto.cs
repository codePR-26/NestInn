namespace NestInn.API.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal PlatformFee { get; set; }
        public DateTime PaidAt { get; set; }
    }
}