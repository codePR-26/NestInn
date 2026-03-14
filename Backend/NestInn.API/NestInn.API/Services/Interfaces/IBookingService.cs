using NestInn.API.DTOs.Booking;

namespace NestInn.API.Services.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto dto, int userId);
        Task<List<BookingResponseDto>> GetUserBookingsAsync(int userId);
        Task<List<BookingResponseDto>> GetOwnerBookingsAsync(int ownerId);
        Task<BookingResponseDto?> GetBookingByIdAsync(int bookingId);
        Task<bool> ConfirmBookingAsync(int bookingId, int ownerId);
        Task<bool> DeclineBookingAsync(int bookingId, int ownerId);
        Task<List<DateTime>> GetUnavailableDatesAsync(int propertyId);
    }
}