using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.Property;
using NestInn.API.Models;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Services.Implementations
{
    public class PropertyService : IPropertyService
    {
        private readonly AppDbContext _context;

        public PropertyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PropertyResponseDto> CreatePropertyAsync(CreatePropertyDto dto, int ownerId)
        {
            var property = new Property
            {
                OwnerId = ownerId,
                Title = dto.Title,
                Description = dto.Description,
                PropertyType = dto.PropertyType,
                Location = dto.Location,
                City = dto.City,
                PricePerNight = dto.PricePerNight,
                CheckInTime = dto.CheckInTime,
                CheckOutTime = dto.CheckOutTime,
                NearestTransport = dto.NearestTransport,
                Rules = dto.Rules,
                Amenities = dto.Amenities,
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return await GetPropertyByIdAsync(property.PropertyId)
                ?? throw new Exception("Failed to create property.");
        }

        public async Task<List<PropertyResponseDto>> GetAllPropertiesAsync()
        {
            return await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .Where(p => p.IsAvailable)
                .OrderByDescending(p => p.Rating)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<PropertyResponseDto?> GetPropertyByIdAsync(int id)
        {
            var property = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            return property == null ? null : MapToDto(property);
        }

        public async Task<List<PropertyResponseDto>> SearchPropertiesAsync(PropertySearchDto dto)
        {
            var query = _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .Where(p => p.IsAvailable)
                .AsQueryable();

            if (!string.IsNullOrEmpty(dto.City))
                query = query.Where(p => p.City.Contains(dto.City));

            if (!string.IsNullOrEmpty(dto.PropertyType))
                query = query.Where(p => p.PropertyType == dto.PropertyType);

            if (dto.MinPrice.HasValue)
                query = query.Where(p => p.PricePerNight >= dto.MinPrice.Value);

            if (dto.MaxPrice.HasValue)
                query = query.Where(p => p.PricePerNight <= dto.MaxPrice.Value);

            if (!string.IsNullOrEmpty(dto.Amenities))
                query = query.Where(p => p.Amenities != null &&
                    p.Amenities.Contains(dto.Amenities));

            // Filter by availability dates
            if (dto.CheckInDate.HasValue && dto.CheckOutDate.HasValue)
            {
                var bookedPropertyIds = await _context.Bookings
                    .Where(b =>
                        b.PaymentStatus == "Success" &&
                        b.CheckInDate < dto.CheckOutDate.Value &&
                        b.CheckOutDate > dto.CheckInDate.Value)
                    .Select(b => b.PropertyId)
                    .ToListAsync();

                query = query.Where(p => !bookedPropertyIds.Contains(p.PropertyId));
            }

            return await query
                .OrderByDescending(p => p.Rating)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<List<PropertyResponseDto>> GetTopRatedPropertiesAsync()
        {
            return await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .Where(p => p.IsAvailable)
                .OrderByDescending(p => p.Rating)
                .Take(8)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<List<PropertyResponseDto>> GetOwnerPropertiesAsync(int ownerId)
        {
            return await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .Where(p => p.OwnerId == ownerId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<PropertyResponseDto> UpdatePropertyAsync(
            int id, CreatePropertyDto dto, int ownerId)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id && p.OwnerId == ownerId)
                ?? throw new Exception("Property not found or unauthorized.");

            property.Title = dto.Title;
            property.Description = dto.Description;
            property.PropertyType = dto.PropertyType;
            property.Location = dto.Location;
            property.City = dto.City;
            property.PricePerNight = dto.PricePerNight;
            property.CheckInTime = dto.CheckInTime;
            property.CheckOutTime = dto.CheckOutTime;
            property.NearestTransport = dto.NearestTransport;
            property.Rules = dto.Rules;
            property.Amenities = dto.Amenities;

            await _context.SaveChangesAsync();

            return await GetPropertyByIdAsync(id)
                ?? throw new Exception("Failed to update property.");
        }

        public async Task<bool> DeletePropertyAsync(int id, int ownerId)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id && p.OwnerId == ownerId)
                ?? throw new Exception("Property not found or unauthorized.");

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddPropertyImageAsync(
            int propertyId, string imageUrl, int order)
        {
            var image = new PropertyImage
            {
                PropertyId = propertyId,
                ImageUrl = imageUrl,
                DisplayOrder = order,
                UploadedAt = DateTime.UtcNow
            };

            _context.PropertyImages.Add(image);
            await _context.SaveChangesAsync();
            return true;
        }

        private static PropertyResponseDto MapToDto(Property p) => new()
        {
            PropertyId = p.PropertyId,
            OwnerId = p.OwnerId,
            OwnerName = p.Owner?.FullName ?? "",
            Title = p.Title,
            Description = p.Description,
            PropertyType = p.PropertyType,
            Location = p.Location,
            City = p.City,
            PricePerNight = p.PricePerNight,
            CheckInTime = p.CheckInTime,
            CheckOutTime = p.CheckOutTime,
            NearestTransport = p.NearestTransport,
            Rules = p.Rules,
            Amenities = p.Amenities,
            IsAvailable = p.IsAvailable,
            Rating = p.Rating,
            CreatedAt = p.CreatedAt,
            Images = p.Images?
                .OrderBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl)
                .ToList() ?? new()
        };
    }
}