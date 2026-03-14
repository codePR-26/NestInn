using NestInn.API.DTOs.Payment;

namespace NestInn.API.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> ProcessPaymentAsync(PaymentRequestDto dto, int userId);
        Task<PaymentResponseDto> ProcessRefundAsync(int bookingId);
        Task<byte[]> GenerateInvoiceAsync(int bookingId);
    }
}