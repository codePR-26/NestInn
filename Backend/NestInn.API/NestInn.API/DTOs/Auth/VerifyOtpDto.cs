using System.ComponentModel.DataAnnotations;

namespace NestInn.API.DTOs.Auth
{
    public class VerifyOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string OTPCode { get; set; } = string.Empty;
    }
}