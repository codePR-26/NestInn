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
                return ex switch
                {
                    KeyNotFoundException => NotFound(ApiResponse<string>.Fail(ex.Message)),
                    _ => StatusCode(500, ApiResponse<string>.Fail("Something went wrong."))
                };
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
            catch (Exception ex) when (ex is KeyNotFoundException)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
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
                return ex switch
                {
                    ArgumentException => BadRequest(ApiResponse<string>.Fail(ex.Message)),
                    KeyNotFoundException => NotFound(ApiResponse<string>.Fail(ex.Message)),
                    _ => StatusCode(500, ApiResponse<string>.Fail("Search failed."))
                };
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
            catch (Exception ex) when (ex is UnauthorizedAccessException)
            {
                return Unauthorized(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex) when (ex is KeyNotFoundException)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
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
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
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
                return HandleUpdateException(ex);
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
                var errorMap = new Dictionary<Type, IActionResult>
                {
                    { typeof(KeyNotFoundException), NotFound(ApiResponse<string>.Fail(ex.Message)) },
                    { typeof(UnauthorizedAccessException), Unauthorized(ApiResponse<string>.Fail(ex.Message)) }
                };
                return errorMap.TryGetValue(ex.GetType(), out var result)
                    ? result
                    : StatusCode(500, ApiResponse<string>.Fail("Something went wrong."));
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Fail("Image upload failed."));
            }
        }

        private IActionResult HandleUpdateException(Exception ex)
        {
            return ex switch
            {
                KeyNotFoundException => NotFound(ApiResponse<string>.Fail(ex.Message)),
                UnauthorizedAccessException => Unauthorized(ApiResponse<string>.Fail(ex.Message)),
                ArgumentException => BadRequest(ApiResponse<string>.Fail(ex.Message)),
                _ => StatusCode(500, ApiResponse<string>.Fail("Update failed."))
            };
        }
    }
}