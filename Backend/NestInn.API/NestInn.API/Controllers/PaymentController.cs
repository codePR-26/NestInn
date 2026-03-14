using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.Payment;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly JwtHelper _jwtHelper;

        public PaymentController(IPaymentService paymentService, JwtHelper jwtHelper)
        {
            _paymentService = paymentService;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("initiate")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> Initiate([FromBody] PaymentRequestDto dto)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _paymentService.ProcessPaymentAsync(dto, userId);
                return Ok(ApiResponse<PaymentResponseDto>.Ok(result,
                    "Payment successful!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("confirm-payment")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PaymentRequestDto dto)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _paymentService.ProcessPaymentAsync(dto, userId);
                return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment successful!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("refund/{bookingId}")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> Refund(int bookingId)
        {
            try
            {
                var result = await _paymentService.ProcessRefundAsync(bookingId);
                return Ok(ApiResponse<PaymentResponseDto>.Ok(result,
                    "Refund initiated successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("invoice/{bookingId}")]
        public async Task<IActionResult> GetInvoice(int bookingId)
        {
            try
            {
                var invoice = await _paymentService.GenerateInvoiceAsync(bookingId);
                return File(invoice, "text/html",
                    $"NestInn_Invoice_{bookingId}.html");
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}