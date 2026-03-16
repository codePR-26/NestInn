using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.CEO;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "CEO")]   // I'm the Boss.
    public class CeoController : ControllerBase
    {
        private readonly ICeoService _ceoService;

        public CeoController(ICeoService ceoService)
        {
            _ceoService = ceoService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var result = await _ceoService.GetDashboardSummaryAsync();
                return Ok(ApiResponse<DashboardSummaryDto>.Ok(result));
            }
            catch (Exception ex)  // This is CEO Dashboard, not for others. ha ha ha!!!!
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarnings()
        {
            try
            {
                var result = await _ceoService.GetEarningsSummaryAsync();
                return Ok(ApiResponse<EarningsSummaryDto>.Ok(result));
            }
            catch (Exception ex)   // It's My Money, I'm rich.
            {
                return Unauthorized(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> Withdraw([FromBody] WithdrawDto dto)
        {
            try
            {
                await _ceoService.WithdrawAsync(dto.Amount);

                return Ok(ApiResponse<string>.Ok(
                    $"₹{dto.Amount:N2} withdrawn successfully Check Bank!!"   // Paisa direct Bank pe ayega.
                ));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _ceoService.GetUsersAsync();
            return Ok(ApiResponse<object>.Ok(users));
        }


        [HttpGet("properties")]
        public async Task<IActionResult> GetProperties()
        {
            var properties = await _ceoService.GetPropertiesAsync();
            return Ok(ApiResponse<object>.Ok(properties));
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookings()
        {
            var bookings = await _ceoService.GetBookingsAsync();
            return Ok(ApiResponse<object>.Ok(bookings));
        }
    }

}