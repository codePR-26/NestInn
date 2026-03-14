using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.Payment;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;
using System.Text;

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

            // Dummy payment - always succeeds
            // Will be replaced by RazorPay later
            var transactionId = $"NESTINN-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            booking.PaymentStatus = "Success";
            await _context.SaveChangesAsync();

            // Create earning record (10% platform fee)
            var earning = new Earning
            {
                BookingId = booking.BookingId,
                Amount = booking.PlatformFee,
                EarnedAt = DateTime.UtcNow,
                IsWithdrawn = false
            };

            _context.Earnings.Add(earning);
            await _context.SaveChangesAsync();

            // Generate invoice
            var invoicePdf = await GenerateInvoiceAsync(booking.BookingId);

            // Send invoice to user
            await _emailService.SendInvoiceEmailAsync(
                booking.User.Email,
                booking.User.FullName,
                invoicePdf,
                booking.BookingId);

            // Send booking alert to owner
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

            // Remove earning record
            var earning = await _context.Earnings
                .FirstOrDefaultAsync(e => e.BookingId == bookingId);
            if (earning != null)
                _context.Earnings.Remove(earning);

            await _context.SaveChangesAsync();

            // Send refund email
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

            // Generate HTML invoice as bytes
            // In Sprint 3 we'll convert to PDF using a library
            var html = $@"
            <!DOCTYPE html>
            <html>
            <head><style>
                body {{ font-family: 'Segoe UI', sans-serif; background: #f0f7f7; margin: 0; padding: 20px; }}
                .invoice {{ max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #0d4f4f, #1a7a7a); padding: 30px; color: #fff; }}
                .header h1 {{ color: #4ecdc4; margin: 0; font-size: 1.8rem; }}
                .header p {{ color: rgba(255,255,255,0.7); margin: 4px 0 0; }}
                .body {{ padding: 30px; }}
                .row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f7f7; }}
                .label {{ color: #888; }}
                .value {{ font-weight: 600; color: #0d4f4f; }}
                .total {{ background: #f0f7f7; border-radius: 8px; padding: 16px; margin-top: 20px; }}
                .footer {{ background: #0d4f4f; padding: 16px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.8rem; }}
            </style></head>
            <body>
                <div class='invoice'>
                    <div class='header'>
                        <h1>NestInn</h1>
                        <p>Booking Invoice #{booking.BookingId}</p>
                    </div>
                    <div class='body'>
                        <div class='row'><span class='label'>Guest Name</span><span class='value'>{booking.User.FullName}</span></div>
                        <div class='row'><span class='label'>Property</span><span class='value'>{booking.Property.Title}</span></div>
                        <div class='row'><span class='label'>Location</span><span class='value'>{booking.Property.City}</span></div>
                        <div class='row'><span class='label'>Check-In</span><span class='value'>{booking.CheckInDate:dd MMM yyyy}</span></div>
                        <div class='row'><span class='label'>Check-Out</span><span class='value'>{booking.CheckOutDate:dd MMM yyyy}</span></div>
                        <div class='row'><span class='label'>Total Nights</span><span class='value'>{booking.TotalNights}</span></div>
                        <div class='row'><span class='label'>Price/Night</span><span class='value'>₹{booking.Property.PricePerNight:N2}</span></div>
                        <div class='total'>
                            <div class='row'><span class='label'>Total Amount</span><span class='value'>₹{booking.TotalAmount:N2}</span></div>
                        </div>
                    </div>
                    <div class='footer'>© 2026 NestInn, Inc. · Thank you for choosing NestInn!</div>
                </div>
            </body>
            </html>";

            return Encoding.UTF8.GetBytes(html);
        }
    }
}