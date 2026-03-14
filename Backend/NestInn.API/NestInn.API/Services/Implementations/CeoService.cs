using Microsoft.EntityFrameworkCore;
using NestInn.API.Data;
using NestInn.API.DTOs.CEO;
using NestInn.API.Services.Interfaces;

namespace NestInn.API.Services.Implementations
{
    public class CeoService : ICeoService
    {
        private readonly AppDbContext _context;

        public CeoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var totalUsers = await _context.Users
                .CountAsync(u => u.Role == "Renter");
            var totalOwners = await _context.Users
                .CountAsync(u => u.Role == "Owner");
            var totalProperties = await _context.Properties.CountAsync();
            var totalBookings = await _context.Bookings.CountAsync();
            var confirmedBookings = await _context.Bookings
                .CountAsync(b => b.BookingStatus == "Confirmed");
            var pendingBookings = await _context.Bookings
                .CountAsync(b => b.BookingStatus == "Pending");

            var totalEarnings = await _context.Earnings.SumAsync(e => e.Amount);
            var withdrawn = await _context.Earnings
                .Where(e => e.IsWithdrawn)
                .SumAsync(e => e.Amount);
            var pending = totalEarnings - withdrawn;

            // Monthly chart data for current year
            var currentYear = DateTime.UtcNow.Year;
            var monthlyData = await _context.Earnings
                .Where(e => e.EarnedAt.Year == currentYear)
                .GroupBy(e => e.EarnedAt.Month)
                .Select(g => new MonthlyEarningDto
                {
                    Month = g.Key.ToString(),
                    Amount = g.Sum(e => e.Amount)
                })
                .ToListAsync();

            return new DashboardSummaryDto
            {
                TotalUsers = totalUsers,
                TotalOwners = totalOwners,
                TotalProperties = totalProperties,
                TotalBookings = totalBookings,
                TotalConfirmedBookings = confirmedBookings,
                TotalPendingBookings = pendingBookings,
                TotalEarnings = totalEarnings,
                PendingWithdrawal = pending,
                MonthlyChart = monthlyData
            };
        }

        public async Task<EarningsSummaryDto> GetEarningsSummaryAsync()
        {
            var now = DateTime.UtcNow;
            var startOfDay = now.Date;
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfYear = new DateTime(now.Year, 1, 1);

            var today = await _context.Earnings
                .Where(e => e.EarnedAt >= startOfDay)
                .SumAsync(e => e.Amount);

            var weekly = await _context.Earnings
                .Where(e => e.EarnedAt >= startOfWeek)
                .SumAsync(e => e.Amount);

            var monthly = await _context.Earnings
                .Where(e => e.EarnedAt >= startOfMonth)
                .SumAsync(e => e.Amount);

            var annual = await _context.Earnings
                .Where(e => e.EarnedAt >= startOfYear)
                .SumAsync(e => e.Amount);

            var total = await _context.Earnings.SumAsync(e => e.Amount);

            var withdrawn = await _context.Earnings
                .Where(e => e.IsWithdrawn)
                .SumAsync(e => e.Amount);

            return new EarningsSummaryDto
            {
                TodayEarnings = today,
                WeeklyEarnings = weekly,
                MonthlyEarnings = monthly,
                AnnualEarnings = annual,
                TotalEarnings = total,
                TotalWithdrawn = withdrawn,
                PendingWithdrawal = total - withdrawn
            };
        }

        public async Task<bool> WithdrawAsync(decimal amount)
        {
            var pendingEarnings = await _context.Earnings
                .Where(e => !e.IsWithdrawn)
                .OrderBy(e => e.EarnedAt)
                .ToListAsync();

            var totalPending = pendingEarnings.Sum(e => e.Amount);

            if (amount > totalPending)
                throw new Exception("Insufficient balance.");

            decimal remaining = amount;

            foreach (var earning in pendingEarnings)
            {
                if (remaining <= 0)
                    break;

                if (earning.Amount <= remaining)
                {
                    // withdraw full earning
                    earning.IsWithdrawn = true;
                    earning.WithdrawnAt = DateTime.UtcNow;
                    remaining -= earning.Amount;
                }
                else
                {
                    // partial withdraw from this earning
                    earning.Amount -= remaining;
                    remaining = 0;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<object>> GetUsersAsync()
        {
            return await _context.Users
                .Select(u => new {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.IsVerified,
                    u.CreatedAt
                })
                .ToListAsync<object>();
        }

        public async Task<List<object>> GetPropertiesAsync()
        {
            return await _context.Properties
                .Select(p => new {
                    p.PropertyId,
                    p.Title,
                    p.City,
                    p.PropertyType,
                    p.PricePerNight,
                    p.Rating,
                    p.IsAvailable
                })
                .ToListAsync<object>();
        }

        public async Task<List<object>> GetBookingsAsync()
        {
            return await _context.Bookings
                .Select(b => new {
                    b.BookingId,
                    b.UserId,
                    b.PropertyId,
                    b.CheckInDate,
                    b.TotalAmount,
                    b.BookingStatus,
                    b.PaymentStatus
                })
                .ToListAsync<object>();
        }
    }
}