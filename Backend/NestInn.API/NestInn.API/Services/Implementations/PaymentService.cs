using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.Payment;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace NestInn.API.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PaymentService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<PaymentResponseDto> ProcessPaymentAsync(
            PaymentRequestDto dto, int userId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                    .ThenInclude(p => p.Owner)
                .FirstOrDefaultAsync(b =>
                    b.BookingId == dto.BookingId &&
                    b.UserId == userId)
                ?? throw new Exception("Booking not found.");

            if (booking.PaymentStatus == "Success")
                throw new Exception("Payment already completed.");

            
            var transactionId = $"NESTINN-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            booking.PaymentStatus = "Success";
            await _context.SaveChangesAsync();

            
            var earning = new Earning
            {
                BookingId = booking.BookingId,
                Amount = booking.PlatformFee,
                EarnedAt = DateTime.UtcNow,
                IsWithdrawn = false
            };

            _context.Earnings.Add(earning);
            await _context.SaveChangesAsync();

            var invoicePdf = await GenerateInvoiceAsync(booking.BookingId);

            
            await _emailService.SendInvoiceEmailAsync(
                booking.User.Email,
                booking.User.FullName,
                invoicePdf,
                booking.BookingId);

           
            await _emailService.SendOwnerBookingAlertAsync(
                booking.Property.Owner.Email,
                booking.Property.Owner.FullName,
                booking.BookingId);

            return new PaymentResponseDto
            {
                Success = true,
                Message = "Payment successful! Invoice sent to your email.",
                TransactionId = transactionId,
                Amount = booking.TotalAmount,
                PlatformFee = booking.PlatformFee,
                PaidAt = DateTime.UtcNow
            };
        }

        public async Task<PaymentResponseDto> ProcessRefundAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId)
                ?? throw new Exception("Booking not found.");

            booking.PaymentStatus = "Refunded";
            booking.BookingStatus = "Cancelled";

            
            var earning = await _context.Earnings
                .FirstOrDefaultAsync(e => e.BookingId == bookingId);
            if (earning != null)
                _context.Earnings.Remove(earning);

            await _context.SaveChangesAsync();

           
            await _emailService.SendRefundEmailAsync(
                booking.User.Email,
                booking.User.FullName,
                booking.TotalAmount);

            return new PaymentResponseDto
            {
                Success = true,
                Message = "Refund initiated. Amount will be credited in 3-4 days.",
                Amount = booking.TotalAmount,
                PaidAt = DateTime.UtcNow
            };
        }

        public async Task<byte[]> GenerateInvoiceAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId)
                ?? throw new Exception("Booking not found.");

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);

                    page.Header().Text("NestInn Booking Invoice")
                        .FontSize(24)
                        .Bold()
                        .AlignCenter();

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Text($"Invoice #: {booking.BookingId}");
                        col.Item().Text($"Guest: {booking.User.FullName}");
                        col.Item().Text($"Property: {booking.Property.Title}");
                        col.Item().Text($"Location: {booking.Property.City}");
                        col.Item().Text($"Check-In: {booking.CheckInDate:dd MMM yyyy}");
                        col.Item().Text($"Check-Out: {booking.CheckOutDate:dd MMM yyyy}");
                        col.Item().Text($"Total Nights: {booking.TotalNights}");
                        col.Item().Text($"Price/Night: ₹{booking.Property.PricePerNight:N2}");

                        col.Item().LineHorizontal(1);

                        col.Item().Text($"Total Amount: ₹{booking.TotalAmount:N2}")
                            .FontSize(16)
                            .Bold();
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text("© 2026 NestInn, Inc.");
                });
            }).GeneratePdf();

            return pdf;
        }
    }
}