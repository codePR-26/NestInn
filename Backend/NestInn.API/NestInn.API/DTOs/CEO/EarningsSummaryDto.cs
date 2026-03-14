namespace NestInn.API.DTOs.CEO
{
    public class EarningsSummaryDto
    {
        public decimal TodayEarnings { get; set; }
        public decimal WeeklyEarnings { get; set; }
        public decimal MonthlyEarnings { get; set; }
        public decimal AnnualEarnings { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal TotalWithdrawn { get; set; }
        public decimal PendingWithdrawal { get; set; }
    }
}