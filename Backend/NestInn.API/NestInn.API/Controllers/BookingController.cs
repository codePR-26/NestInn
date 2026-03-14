using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.Booking;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly JwtHelper _jwtHelper;

        public BookingController(IBookingService bookingService, JwtHelper jwtHelper)
        {
            _bookingService = bookingService;
            _jwtHelper = jwtHelper;
        }

        [HttpPost]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _bookingService.CreateBookingAsync(dto, userId);
                return Ok(ApiResponse<BookingResponseDto>.Ok(result,
                    "Booking created successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("my-bookings")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> GetMyBookings()
        {
            try
            {
                var userId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _bookingService.GetUserBookingsAsync(userId);
                return Ok(ApiResponse<List<BookingResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("owner-bookings")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetOwnerBookings()
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _bookingService.GetOwnerBookingsAsync(ownerId);
                return Ok(ApiResponse<List<BookingResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _bookingService.GetBookingByIdAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<string>.Fail("Booking not found."));
                return Ok(ApiResponse<BookingResponseDto>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Confirm(int id)
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                await _bookingService.ConfirmBookingAsync(id, ownerId);
                return Ok(ApiResponse<string>.Ok("Booking confirmed successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}/decline")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Decline(int id)
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                await _bookingService.DeclineBookingAsync(id, ownerId);
                return Ok(ApiResponse<string>.Ok("Booking declined."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("unavailable-dates/{propertyId}")]
        public async Task<IActionResult> GetUnavailableDates(int propertyId)
        {
            try
            {
                var dates = await _bookingService.GetUnavailableDatesAsync(propertyId);
                return Ok(ApiResponse<List<DateTime>>.Ok(dates));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}