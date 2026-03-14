using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NestInn.API.DTOs.Property;
using NestInn.API.Helpers;
using NestInn.API.Services.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace NestInn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyService _propertyService;
        private readonly JwtHelper _jwtHelper;
        private readonly Cloudinary _cloudinary;

        public PropertyController(
            IPropertyService propertyService,
            JwtHelper jwtHelper,
            Cloudinary cloudinary)
        {
            _propertyService = propertyService;
            _jwtHelper = jwtHelper;
            _cloudinary = cloudinary;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _propertyService.GetAllPropertiesAsync();
                return Ok(ApiResponse<List<PropertyResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated()
        {
            try
            {
                var result = await _propertyService.GetTopRatedPropertiesAsync();
                return Ok(ApiResponse<List<PropertyResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _propertyService.GetPropertyByIdAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<string>.Fail("Property not found."));
                return Ok(ApiResponse<PropertyResponseDto>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] PropertySearchDto dto)
        {
            try
            {
                var result = await _propertyService.SearchPropertiesAsync(dto);
                return Ok(ApiResponse<List<PropertyResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("my-properties")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyProperties()
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _propertyService.GetOwnerPropertiesAsync(ownerId);
                return Ok(ApiResponse<List<PropertyResponseDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Create([FromBody] CreatePropertyDto dto)
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _propertyService.CreatePropertyAsync(dto, ownerId);
                return Ok(ApiResponse<PropertyResponseDto>.Ok(result,
                    "Property created successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePropertyDto dto)
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                var result = await _propertyService.UpdatePropertyAsync(id, dto, ownerId);
                return Ok(ApiResponse<PropertyResponseDto>.Ok(result,
                    "Property updated successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ownerId = _jwtHelper.GetUserIdFromToken(User)!.Value;
                await _propertyService.DeletePropertyAsync(id, ownerId);
                return Ok(ApiResponse<string>.Ok("Property deleted successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("{id}/images")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> UploadImage(
    int id, IFormFile file, [FromQuery] int order = 1)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse<string>.Fail("No file uploaded."));

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "nestinn/properties"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                    return BadRequest(ApiResponse<string>.Fail("Image upload failed."));

                var imageUrl = uploadResult.SecureUrl.ToString();

                await _propertyService.AddPropertyImageAsync(id, imageUrl, order);

                return Ok(ApiResponse<string>.Ok(imageUrl, "Image uploaded successfully!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}