using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.Message;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Services.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _context;

        public MessageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MessageResponseDto> SendMessageAsync(
            SendMessageDto dto, int senderId)
        {
            // Check booking exists and payment is successful
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b =>
                    b.BookingId == dto.BookingId &&
                    b.PaymentStatus == "Success")
                ?? throw new Exception(
                    "Chat is only available after successful payment.");

            // Verify sender is part of this booking
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == booking.PropertyId)
                ?? throw new Exception("Property not found.");

            bool isRenter = booking.UserId == senderId;
            bool isOwner = property.OwnerId == senderId;

            if (!isRenter && !isOwner)
                throw new Exception("Unauthorized to send message in this booking.");

            int receiverId = isRenter ? property.OwnerId : booking.UserId;

            var message = new Message
            {
                BookingId = dto.BookingId,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = dto.Content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var sender = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == senderId);
            var receiver = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == receiverId);

            return new MessageResponseDto
            {
                MessageId = message.MessageId,
                BookingId = message.BookingId,
                SenderId = message.SenderId,
                SenderName = sender?.FullName ?? "",
                ReceiverId = message.ReceiverId,
                ReceiverName = receiver?.FullName ?? "",
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            };
        }

        public async Task<List<MessageResponseDto>> GetBookingMessagesAsync(
            int bookingId, int userId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId)
                ?? throw new Exception("Booking not found.");

            bool isRenter = booking.UserId == userId;
            bool isOwner = booking.Property.OwnerId == userId;

            if (!isRenter && !isOwner)
                throw new Exception("Unauthorized.");

            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.BookingId == bookingId)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageResponseDto
                {
                    MessageId = m.MessageId,
                    BookingId = m.BookingId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    ReceiverId = m.ReceiverId,
                    ReceiverName = m.Receiver.FullName,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .FirstOrDefaultAsync(m =>
                    m.MessageId == messageId &&
                    m.ReceiverId == userId)
                ?? throw new Exception("Message not found.");

            message.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}