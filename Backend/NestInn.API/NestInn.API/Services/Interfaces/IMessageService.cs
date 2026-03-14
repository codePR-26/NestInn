using NestInn.API.DTOs.Message;

namespace NestInn.API.Services.Interfaces
{
    public interface IMessageService
    {
        Task<MessageResponseDto> SendMessageAsync(SendMessageDto dto, int senderId);
        Task<List<MessageResponseDto>> GetBookingMessagesAsync(int bookingId, int userId);
        Task<bool> MarkAsReadAsync(int messageId, int userId);
    }
}