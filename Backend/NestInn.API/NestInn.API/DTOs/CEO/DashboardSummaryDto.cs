using NestInn.API.DTOs.Auth;
using NestInn.API.DTOs.Booking;
using NestInn.API.DTOs.CEO;
using NestInn.API.DTOs.Message;
using NestInn.API.DTOs.Payment;
using NestInn.API.DTOs.Property;
using NestInn.API.Models;
using System.Runtime.ConstrainedExecution;

namespace NestInn.API.DTOs.CEO
{
    public class DashboardSummaryDto
    {
        public int TotalUsers { get; set; }
        public int TotalOwners { get; set; }
        public int TotalProperties { get; set; }
        public int TotalBookings { get; set; }
        public int TotalConfirmedBookings { get; set; }
        public int TotalPendingBookings { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal PendingWithdrawal { get; set; }
        public List<MonthlyEarningDto> MonthlyChart { get; set; } = new();
    }

    public class MonthlyEarningDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
