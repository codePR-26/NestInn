using System.ComponentModel.DataAnnotations;

namespace NestInn.API.DTOs.Message
{
    public class SendMessageDto
    {
        [Required]
        public int BookingId { get; set; }


        [Required]
        public string Content { get; set; } = string.Empty;
    }
}