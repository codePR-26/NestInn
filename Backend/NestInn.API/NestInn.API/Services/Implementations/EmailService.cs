using MailKit.Net.Smtp;
using MimeKit;
using NestInn.API.Data;
using NestInn.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace NestInn.API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public EmailService(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        private async Task SendEmailAsync(
            string toEmail, string toName, string subject, string htmlBody)
        {
            var emailSettings = _config.GetSection("EmailSettings");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                emailSettings["SenderName"], emailSettings["SenderEmail"]));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                emailSettings["SmtpHost"],
                int.Parse(emailSettings["SmtpPort"]!),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                emailSettings["SenderEmail"],
                emailSettings["SenderPassword"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendOtpEmailAsync(
            string toEmail, string name, string otp)
        {
            var html = $@"
            <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;'>
                <div style='background:linear-gradient(135deg,#0d4f4f,#1a7a7a);padding:30px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#4ecdc4;margin:0;'>NestInn</h1>
                    <p style='color:rgba(255,255,255,0.7);'>Your Perfect Stay, Every Time</p>
                </div>
                <div style='background:#fff;padding:30px;'>
                    <h2 style='color:#0d4f4f;'>Hi {name}! 👋</h2>
                    <p>Your OTP to verify your NestInn account:</p>
                    <div style='background:#f0f7f7;border:2px dashed #4ecdc4;border-radius:12px;padding:24px;text-align:center;margin:20px 0;'>
                        <div style='font-size:2.5rem;font-weight:800;color:#0d4f4f;letter-spacing:8px;'>{otp}</div>
                        <p style='color:#888;font-size:0.85rem;'>⏱ Expires in 10 minutes</p>
                    </div>
                </div>
                <div style='background:#0d4f4f;padding:16px;text-align:center;border-radius:0 0 16px 16px;'>
                    <p style='color:rgba(255,255,255,0.5);font-size:0.8rem;margin:0;'>© 2026 NestInn, Inc.</p>
                </div>
            </div>";

            await SendEmailAsync(toEmail, name, "NestInn - Verify Your Email", html);
        }

        public async Task SendBookingConfirmationAsync(
            string toEmail, string name, int bookingId)
        {
            var html = $@"
            <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;'>
                <div style='background:linear-gradient(135deg,#0d4f4f,#1a7a7a);padding:30px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#4ecdc4;margin:0;'>NestInn</h1>
                </div>
                <div style='background:#fff;padding:30px;'>
                    <h2 style='color:#0d4f4f;'>Booking Confirmed! 🎉</h2>
                    <p>Hi {name}, your booking #{bookingId} has been confirmed.</p>
                    <p>You can now chat with your host through the NestInn app.</p>
                </div>
                <div style='background:#0d4f4f;padding:16px;text-align:center;border-radius:0 0 16px 16px;'>
                    <p style='color:rgba(255,255,255,0.5);font-size:0.8rem;margin:0;'>© 2026 NestInn, Inc.</p>
                </div>
            </div>";

            await SendEmailAsync(toEmail, name,
                $"NestInn - Booking #{bookingId} Confirmed", html);
        }

        public async Task SendInvoiceEmailAsync(
            string toEmail, string name, byte[] invoicePdf, int bookingId)
        {
            var emailSettings = _config.GetSection("EmailSettings");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                emailSettings["SenderName"], emailSettings["SenderEmail"]));
            message.To.Add(new MailboxAddress(name, toEmail));
            message.Subject = $"NestInn - Invoice for Booking #{bookingId}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;'>
                    <div style='background:linear-gradient(135deg,#0d4f4f,#1a7a7a);padding:30px;border-radius:16px 16px 0 0;text-align:center;'>
                        <h1 style='color:#4ecdc4;margin:0;'>NestInn</h1>
                    </div>
                    <div style='background:#fff;padding:30px;'>
                        <h2 style='color:#0d4f4f;'>Payment Successful! 💳</h2>
                        <p>Hi {name}, your payment for booking #{bookingId} was successful.</p>
                        <p>Please find your invoice attached to this email.</p>
                    </div>
                    <div style='background:#0d4f4f;padding:16px;text-align:center;border-radius:0 0 16px 16px;'>
                        <p style='color:rgba(255,255,255,0.5);font-size:0.8rem;margin:0;'>© 2026 NestInn, Inc.</p>
                    </div>
                </div>"
            };

            bodyBuilder.Attachments.Add(
                $"NestInn_Invoice_{bookingId}.html",
                invoicePdf,
                ContentType.Parse("text/html"));

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                emailSettings["SmtpHost"],
                int.Parse(emailSettings["SmtpPort"]!),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                emailSettings["SenderEmail"],
                emailSettings["SenderPassword"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendOwnerBookingAlertAsync(
            string ownerEmail, string ownerName, int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            var html = $@"
            <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;'>
                <div style='background:linear-gradient(135deg,#0d4f4f,#1a7a7a);padding:30px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#4ecdc4;margin:0;'>NestInn</h1>
                </div>
                <div style='background:#fff;padding:30px;'>
                    <h2 style='color:#0d4f4f;'>New Booking Alert! 🏠</h2>
                    <p>Hi {ownerName}, your property has been booked!</p>
                    <div style='background:#f0f7f7;border-radius:8px;padding:16px;margin:16px 0;'>
                        <p><strong>Property:</strong> {booking?.Property?.Title}</p>
                        <p><strong>Guest:</strong> {booking?.User?.FullName}</p>
                        <p><strong>Check-In:</strong> {booking?.CheckInDate:dd MMM yyyy}</p>
                        <p><strong>Check-Out:</strong> {booking?.CheckOutDate:dd MMM yyyy}</p>
                        <p><strong>Amount:</strong> ₹{booking?.OwnerAmount:N2}</p>
                    </div>
                    <p>Please log in to NestInn to confirm the booking.</p>
                </div>
                <div style='background:#0d4f4f;padding:16px;text-align:center;border-radius:0 0 16px 16px;'>
                    <p style='color:rgba(255,255,255,0.5);font-size:0.8rem;margin:0;'>© 2026 NestInn, Inc.</p>
                </div>
            </div>";

            await SendEmailAsync(ownerEmail, ownerName,
                "NestInn - New Booking Alert!", html);
        }

        public async Task SendRefundEmailAsync(
            string toEmail, string name, decimal amount)
        {
            var html = $@"
            <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;'>
                <div style='background:linear-gradient(135deg,#0d4f4f,#1a7a7a);padding:30px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#4ecdc4;margin:0;'>NestInn</h1>
                </div>
                <div style='background:#fff;padding:30px;'>
                    <h2 style='color:#0d4f4f;'>Refund Initiated 💰</h2>
                    <p>Hi {name}, your refund of <strong>₹{amount:N2}</strong> has been initiated.</p>
                    <p>Amount will be credited to your account within <strong>3-4 business days</strong>.</p>
                </div>
                <div style='background:#0d4f4f;padding:16px;text-align:center;border-radius:0 0 16px 16px;'>
                    <p style='color:rgba(255,255,255,0.5);font-size:0.8rem;margin:0;'>© 2026 NestInn, Inc.</p>
                </div>
            </div>";

            await SendEmailAsync(toEmail, name, "NestInn - Refund Initiated", html);
        }
    }
}