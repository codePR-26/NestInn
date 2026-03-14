using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.Message;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly JwtHelper _jwtHelper;

        public MessageController(IMessageService messageService, JwtHelper jwtHelper)
        {
            _messageService = messageService;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
        {
            try
            {
                var senderId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _messageService.SendMessageAsync(dto, senderId);
                return Ok(ApiResponse<MessageResponseDto>.Ok(result,
                    "Message sent successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetMessages(int bookingId)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _messageService.GetBookingMessagesAsync(
                    bookingId, userId);
                return Ok(ApiResponse<List<MessageResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("read/{messageId}")]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                await _messageService.MarkAsReadAsync(messageId, userId);
                return Ok(ApiResponse<string>.Ok("Message marked as read."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}