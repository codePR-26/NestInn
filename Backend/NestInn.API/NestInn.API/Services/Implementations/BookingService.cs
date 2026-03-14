using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.Booking;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public BookingService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(
            CreateBookingDto dto, int userId)
        {
            var property = await _context.Properties
                .Include(p => p.Owner)
                .FirstOrDefaultAsync(p => p.PropertyId == dto.PropertyId)
                ?? throw new Exception("Property not found.");

            if (!property.IsAvailable)
                throw new Exception("Property is not available.");

            // Check date conflict
            var conflict = await _context.Bookings
                .AnyAsync(b =>
                    b.PropertyId == dto.PropertyId &&
                    b.PaymentStatus == "Success" &&
                    b.CheckInDate < dto.CheckOutDate &&
                    b.CheckOutDate > dto.CheckInDate);

            if (conflict)
                throw new Exception("Property is already booked for selected dates.");

            var totalNights = (dto.CheckOutDate - dto.CheckInDate).Days;
            if (totalNights <= 0)
                throw new Exception("Check-out date must be after check-in date.");

            var totalAmount = property.PricePerNight * totalNights;
            var platformFee = totalAmount * 0.10m; // 10%
            var ownerAmount = totalAmount - platformFee;

            var booking = new Booking
            {
                UserId = userId,
                PropertyId = dto.PropertyId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                TotalNights = totalNights,
                TotalAmount = totalAmount,
                PlatformFee = platformFee,
                OwnerAmount = ownerAmount,
                BookingStatus = "Pending",
                PaymentStatus = "Pending",
                BookedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return await GetBookingByIdAsync(booking.BookingId)
                ?? throw new Exception("Failed to create booking.");
        }

        public async Task<List<BookingResponseDto>> GetUserBookingsAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookedAt)
                .Select(b => MapToDto(b))
                .ToListAsync();
        }

        public async Task<List<BookingResponseDto>> GetOwnerBookingsAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                .Where(b => b.Property.OwnerId == ownerId)
                .OrderByDescending(b => b.BookedAt)
                .Select(b => MapToDto(b))
                .ToListAsync();
        }

        public async Task<BookingResponseDto?> GetBookingByIdAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            return booking == null ? null : MapToDto(booking);
        }

        public async Task<bool> ConfirmBookingAsync(int bookingId, int ownerId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Property)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b =>
                    b.BookingId == bookingId &&
                    b.Property.OwnerId == ownerId)
                ?? throw new Exception("Booking not found or unauthorized.");

            booking.BookingStatus = "Confirmed";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeclineBookingAsync(int bookingId, int ownerId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b =>
                    b.BookingId == bookingId &&
                    b.Property.OwnerId == ownerId)
                ?? throw new Exception("Booking not found or unauthorized.");

            booking.BookingStatus = "Declined";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<DateTime>> GetUnavailableDatesAsync(int propertyId)
        {
            var bookings = await _context.Bookings
                .Where(b =>
                    b.PropertyId == propertyId &&
                    b.PaymentStatus == "Success")
                .ToListAsync();

            var dates = new List<DateTime>();
            foreach (var booking in bookings)
            {
                var current = booking.CheckInDate;
                while (current < booking.CheckOutDate)
                {
                    dates.Add(current);
                    current = current.AddDays(1);
                }
            }

            return dates;
        }

        private static BookingResponseDto MapToDto(Booking b) => new()
        {
            BookingId = b.BookingId,
            UserId = b.UserId,
            UserName = b.User?.FullName ?? "",
            UserEmail = b.User?.Email ?? "",
            PropertyId = b.PropertyId,
            PropertyTitle = b.Property?.Title ?? "",
            PropertyCity = b.Property?.City ?? "",
            PricePerNight = b.Property?.PricePerNight ?? 0,
            CheckInDate = b.CheckInDate,
            CheckOutDate = b.CheckOutDate,
            TotalNights = b.TotalNights,
            TotalAmount = b.TotalAmount,
            PlatformFee = b.PlatformFee,
            OwnerAmount = b.OwnerAmount,
            BookingStatus = b.BookingStatus,
            PaymentStatus = b.PaymentStatus,
            BookedAt = b.BookedAt
        };
    }
}