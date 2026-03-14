export interface EarningsSummary { today: number; thisWeek: number; thisMonth: number; thisYear: number; total: number; withdrawn: number; pending: number; }
export interface Earning { earningId: number; bookingId: number; amount: number; earnedAt: string; isWithdrawn: boolean; withdrawnAt?: string; }
