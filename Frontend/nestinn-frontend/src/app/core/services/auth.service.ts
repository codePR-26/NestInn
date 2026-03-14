import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, OtpRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);

  constructor(private http: HttpClient) { this.loadUser(); }

  private loadUser() {
    const u = localStorage.getItem('nestinn_user');
    if (u) { this.currentUser.set(JSON.parse(u)); this.isLoggedIn.set(true); }
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API}/auth/register`, data);
  }

  verifyOtp(data: OtpRequest): Observable<any> {
    return this.http.post(`${this.API}/auth/verify-otp`, data).pipe(
      tap((res: any) => {
        if (res.data) { this.setUser(res.data); }
        else if (res.user) { this.setUser(res.user); }
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.API}/auth/resend-otp`, { email });
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.API}/auth/login`, data, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.data) { this.setUser(res.data); }
        else if (res.user) { this.setUser(res.user); }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => { this.clearUser(); })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/auth/me`, { withCredentials: true }).pipe(
      tap(u => this.setUser(u))
    );
  }

  private setUser(u: User) {
    this.currentUser.set(u); this.isLoggedIn.set(true);
    localStorage.setItem('nestinn_user', JSON.stringify(u));
  }

  clearUser() {
    this.currentUser.set(null); this.isLoggedIn.set(false);
    localStorage.removeItem('nestinn_user');
  }

  get role() { return this.currentUser()?.role; }
  get userId() { return this.currentUser()?.userId; }
  isOwner() { return this.role === 'Owner'; }
  isCeo() { return this.role === 'CEO'; }
  isRenter() { return this.role === 'Renter'; }
}