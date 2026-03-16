using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.Auth;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly JwtHelper _jwtHelper;

        public AuthController(IAuthService authService, JwtHelper jwtHelper)
        {
            _authService = authService;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.Ok(result,
                    "Registration Successful! You can now check the Gmail for OTP."));
            }      // this is informing the user to check the mail brooo!            
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            try
            {
                var result = await _authService.VerifyOtpAsync(dto);
                return Ok(ApiResponse<string>.Ok(result, "Email Successfully verified "));   // Brooo the user verify successfully.
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] string email)
        {
            try
            {
                var result = await _authService.ResendOtpAsync(email);
                return Ok(ApiResponse<string>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);

               
                Response.Cookies.Append("nestinn_token", result.Message, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, 
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                result.Message = "Login Successful!";
                return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login Successful!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("nestinn_token");
            return Ok(ApiResponse<string>.Ok("Logged out successful."));
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult Me()
        {
            var userId = _jwtHelper.GetUserIdFromToken(User);
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            return Ok(ApiResponse<object>.Ok(new
            {
                UserId = userId,
                Email = email,
                Role = role,
                FullName = name
            }));
        }
    }
}