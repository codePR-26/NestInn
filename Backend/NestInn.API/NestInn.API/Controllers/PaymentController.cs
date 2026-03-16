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
        //  User check karega and payment process.
        [HttpPost("initiate")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> Initiate([FromBody] PaymentRequestDto dto)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _paymentService.ProcessPaymentAsync(dto, userId);
                return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment successful!"));
            }
            catch (Exception ex) when (ex is ArgumentException)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex) when (ex is InvalidOperationException)
            {
                return UnprocessableEntity(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Payment processing failed."));
            }
        }

        // Payment confirmation or failed.
        [HttpPost("confirm-payment")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PaymentRequestDto dto)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _paymentService.ProcessPaymentAsync(dto, userId);
                return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment confirmed!"));
            }
            catch (Exception ex)
            {
                return ex switch
                {
                    ArgumentException => BadRequest(ApiResponse<string>.Fail(ex.Message)),
                    InvalidOperationException => UnprocessableEntity(ApiResponse<string>.Fail(ex.Message)),
                    KeyNotFoundException => NotFound(ApiResponse<string>.Fail(ex.Message)),
                    _ => StatusCode(500, ApiResponse<string>.Fail("Payment confirmation failed."))
                };
            }
        }

        // Refunding done broooooo.
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
                return HandleRefundException(ex);
            }
        }

        // somthing like invoice generate karna broooooo.
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
                var errorMap = new Dictionary<Type, IActionResult>
                {
                    { typeof(KeyNotFoundException), NotFound(ApiResponse<string>.Fail(ex.Message)) },
                    { typeof(UnauthorizedAccessException), Unauthorized(ApiResponse<string>.Fail(ex.Message)) },
                    { typeof(ArgumentException), BadRequest(ApiResponse<string>.Fail(ex.Message)) }
                };
                return errorMap.TryGetValue(ex.GetType(), out var result)
                    ? result
                    : StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
            }
        }

        private IActionResult HandleRefundException(Exception ex)
        {
            return ex switch
            {
                KeyNotFoundException => NotFound(ApiResponse<string>.Fail(ex.Message)),
                InvalidOperationException => UnprocessableEntity(ApiResponse<string>.Fail(ex.Message)),
                UnauthorizedAccessException => Unauthorized(ApiResponse<string>.Fail(ex.Message)),
                _ => StatusCode(500, ApiResponse<string>.Fail("Refund processing failed."))
            };
        }
    }
}