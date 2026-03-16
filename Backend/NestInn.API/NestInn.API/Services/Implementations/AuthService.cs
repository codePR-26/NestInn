using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using NestInn.API.Data;
using NestInn.API.DTOs.Auth;
using NestInn.API.Helpers;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly JwtHelper _jwtHelper;

        public AuthService(AppDbContext context, IConfiguration config, JwtHelper jwtHelper)
        {
            _context = context;
            _config = config;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingUser != null)
                throw new Exception("Email already registered.");

            
            if (dto.Role == "CEO")
                throw new Exception("Invalid role.");

            
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = hashedPassword,
                Role = dto.Role,
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await GenerateAndSendOtpAsync(user);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                IsVerified = false,
                Message = "Registration successful! Please verify your email with the OTP sent."
            };
        }

        public async Task<string> VerifyOtpAsync(VerifyOtpDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                throw new Exception("User not found.");

            if (user.IsVerified)
                throw new Exception("Account already verified.");

            var otpRecord = await _context.OTPVerifications
                .Where(o => o.UserId == user.UserId && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
                throw new Exception("No OTP found. Please request a new one.");

            if (otpRecord.Attempts >= 3)
                throw new Exception("Too many attempts. Please request a new OTP.");

            if (otpRecord.ExpiresAt < DateTime.UtcNow)
                throw new Exception("OTP has expired. Please request a new one.");

            if (otpRecord.OTPCode != dto.OTPCode)
            {
                otpRecord.Attempts++;
                await _context.SaveChangesAsync();
                throw new Exception($"Invalid OTP. {3 - otpRecord.Attempts} attempts remaining.");
            }

            
            otpRecord.IsUsed = true;
            user.IsVerified = true;
            await _context.SaveChangesAsync();

            return "Email verified successfully! You can now log in.";
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                throw new Exception("Invalid email or password.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new Exception("Invalid email or password.");

            if (!user.IsVerified)
                throw new Exception("Please verify your email before logging in.");

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                IsVerified = user.IsVerified,
                ProfilePicture = user.ProfilePicture,
                Message = _jwtHelper.GenerateToken(user)
            };
        }

        public async Task<string> ResendOtpAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                throw new Exception("User not found.");

            if (user.IsVerified)
                throw new Exception("Account already verified.");

            
            var oldOtps = await _context.OTPVerifications
                .Where(o => o.UserId == user.UserId && !o.IsUsed)
                .ToListAsync();

            foreach (var otp in oldOtps)
                otp.IsUsed = true;

            await _context.SaveChangesAsync();

            
            await GenerateAndSendOtpAsync(user);

            return "New OTP sent to your email.";
        }

        private async Task GenerateAndSendOtpAsync(User user)
        {
            var otpCode = OtpHelper.GenerateOtp();

            var otpRecord = new OTPVerification
            {
                UserId = user.UserId,
                OTPCode = otpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsUsed = false,
                Attempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.OTPVerifications.Add(otpRecord);
            await _context.SaveChangesAsync();

           
            await SendOtpEmailAsync(user.Email, user.FullName, otpCode);
        }

        private async Task SendOtpEmailAsync(string toEmail, string name, string otp)
        {
            var emailSettings = _config.GetSection("EmailSettings");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                emailSettings["SenderName"],
                emailSettings["SenderEmail"]));
            message.To.Add(new MailboxAddress(name, toEmail));
            message.Subject = "NestInn - Verify Your Email";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Segoe UI', sans-serif; background: #f0f7f7; margin: 0; padding: 0; }}
                        .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                        .header {{ background: linear-gradient(135deg, #0d4f4f, #1a7a7a); padding: 40px; text-align: center; }}
                        .header h1 {{ color: #4ecdc4; font-size: 2rem; margin: 0; }}
                        .header p {{ color: rgba(255,255,255,0.8); margin: 8px 0 0; }}
                        .body {{ padding: 40px; }}
                        .body h2 {{ color: #0d4f4f; }}
                        .otp-box {{ background: #f0f7f7; border: 2px dashed #4ecdc4; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }}
                        .otp {{ font-size: 2.5rem; font-weight: 800; color: #0d4f4f; letter-spacing: 8px; }}
                        .expiry {{ color: #888; font-size: 0.85rem; margin-top: 8px; }}
                        .footer {{ background: #0d4f4f; padding: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.8rem; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>NestInn</h1>
                            <p>Your Perfect Stay, Every Time</p>
                        </div>
                        <div class='body'>
                            <h2>Hi {name}! 👋</h2>
                            <p>Welcome to NestInn! Please verify your email address using the OTP below:</p>
                            <div class='otp-box'>
                                <div class='otp'>{otp}</div>
                                <div class='expiry'>⏱ This OTP expires in 10 minutes</div>
                            </div>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class='footer'>
                            © 2026 NestInn, Inc. · Privacy · Terms
                        </div>
                    </div>
                </body>
                </html>"
            };

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
    }
}