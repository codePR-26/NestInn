using NestInn.API.DTOs.Auth;

namespace NestInn.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<string> VerifyOtpAsync(VerifyOtpDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<string> ResendOtpAsync(string email);
    }
}