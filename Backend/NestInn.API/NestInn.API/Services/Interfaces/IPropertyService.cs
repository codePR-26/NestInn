using NestInn.API.DTOs.Property;

namespace NestInn.API.Services.Interfaces
{
    public interface IPropertyService
    {
        Task<PropertyResponseDto> CreatePropertyAsync(CreatePropertyDto dto, int ownerId);
        Task<List<PropertyResponseDto>> GetAllPropertiesAsync();
        Task<PropertyResponseDto?> GetPropertyByIdAsync(int id);
        Task<List<PropertyResponseDto>> SearchPropertiesAsync(PropertySearchDto dto);
        Task<List<PropertyResponseDto>> GetTopRatedPropertiesAsync();
        Task<List<PropertyResponseDto>> GetOwnerPropertiesAsync(int ownerId);
        Task<PropertyResponseDto> UpdatePropertyAsync(int id, CreatePropertyDto dto, int ownerId);
        Task<bool> DeletePropertyAsync(int id, int ownerId);
        Task<bool> AddPropertyImageAsync(int propertyId, string imageUrl, int order);
    }
}