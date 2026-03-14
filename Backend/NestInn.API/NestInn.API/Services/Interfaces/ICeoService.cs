using NestInn.API.DTOs.CEO;

namespace NestInn.API.Services.Interfaces
{
    public interface ICeoService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
        Task<EarningsSummaryDto> GetEarningsSummaryAsync();
        Task<bool> WithdrawAsync(decimal amount);
        Task<List<object>> GetUsersAsync();
        Task<List<object>> GetPropertiesAsync();
        Task<List<object>> GetBookingsAsync();
    }
}