namespace NestInn.API.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string name, string otp);
        Task SendBookingConfirmationAsync(string toEmail, string name, int bookingId);
        Task SendInvoiceEmailAsync(string toEmail, string name, byte[] invoicePdf, int bookingId);
        Task SendOwnerBookingAlertAsync(string ownerEmail, string ownerName, int bookingId);
        Task SendRefundEmailAsync(string toEmail, string name, decimal amount);
    }
}