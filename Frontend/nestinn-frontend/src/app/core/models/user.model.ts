export interface User {
  userId: number; fullName: string; email: string; phone: string;
  role: 'Renter' | 'Owner' | 'CEO'; isVerified: boolean;
  profilePicture?: string; createdAt: string;
}
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; phone: string; password: string; role: 'Renter' | 'Owner'; }
export interface OtpRequest { email: string; otpCode: string; }
