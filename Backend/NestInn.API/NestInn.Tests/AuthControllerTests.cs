using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using NestInn.API.Controllers;
using NestInn.API.DTOs.Auth;
using NestInn.API.Helpers;
using NestInn.API.Services;
using NestInn.API.Services.Interfaces;
using Xunit;

namespace NestInn.Tests
{
    public class AuthControllerTests
    {

        [Fact]
        public async Task Login_Returns_Ok_Result()
        {

            var authServiceMock = new Mock<IAuthService>();

            var configMock = new Mock<IConfiguration>();

            var jwtHelper = new JwtHelper(configMock.Object);

            var dto = new LoginDto
            {
                Email = "test@test.com",
                Password = "123456"
            };

            authServiceMock.Setup(x => x.LoginAsync(dto))
            .ReturnsAsync(new AuthResponseDto { Message = "token" });

            var controller = new AuthController(authServiceMock.Object, jwtHelper);

            var result = await controller.Login(dto);

            Assert.IsAssignableFrom<IActionResult>(result);

        }

    }
}