import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  template: `
<div class="page-wrap">
  <div class="page-hero"><div class="container"><h1>My Profile</h1><p>Manage your account</p></div></div>
  <div class="container" style="padding:36px 0 60px;max-width:640px">
    <div class="profile-card">
      <div class="profile-top">
        <div class="profile-avatar">{{ getInitial() }}</div>
        <div>
          <h2>{{ auth.currentUser()?.fullName }}</h2>
          <div class="profile-role">{{ auth.currentUser()?.role }}</div>
        </div>
      </div>
      <mat-divider></mat-divider>
      <div class="profile-details">
        <div class="pd-row"><mat-icon>email</mat-icon><div><label>Email</label><span>{{ auth.currentUser()?.email }}</span></div></div>
        <div class="pd-row"><mat-icon>phone</mat-icon><div><label>Phone</label><span>{{ auth.currentUser()?.phone }}</span></div></div>
        <div class="pd-row"><mat-icon>verified_user</mat-icon><div><label>Verified</label><span>{{ auth.currentUser()?.isVerified ? '✅ Email Verified' : '❌ Not Verified' }}</span></div></div>
        <div class="pd-row"><mat-icon>badge</mat-icon><div><label>Role</label><span class="badge badge-teal">{{ auth.currentUser()?.role }}</span></div></div>
      </div>
      <mat-divider></mat-divider>
      <div class="profile-actions">
        @if(auth.isOwner()){
          <a mat-stroked-button routerLink="/owner/dashboard" style="border-color:var(--teal);color:var(--teal)"><mat-icon>home</mat-icon> Owner Dashboard</a>
          <a mat-stroked-button routerLink="/owner/properties" style="border-color:var(--teal);color:var(--teal)"><mat-icon>apartment</mat-icon> My Properties</a>
        }
        @if(auth.isRenter()){
          <a mat-stroked-button routerLink="/bookings" style="border-color:var(--teal);color:var(--teal)"><mat-icon>calendar_today</mat-icon> My Bookings</a>
          <a mat-stroked-button routerLink="/properties" style="border-color:var(--teal);color:var(--teal)"><mat-icon>search</mat-icon> Browse Properties</a>
        }
        <button mat-stroked-button color="warn" (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
      </div>
    </div>
  </div>
</div>`,
  styles: [`
    .profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
    .profile-top { display: flex; align-items: center; gap: 20px; padding: 28px; }
    .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--teal); color: #0a2020; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 700; flex-shrink: 0; }
    h2 { font-family: 'Playfair Display',serif; font-size: 24px; color: var(--text-primary); margin-bottom: 6px; }
    .profile-role { display: inline-flex; background: var(--teal-subtle); color: var(--teal); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 50px; }
    .profile-details { padding: 20px 28px; display: flex; flex-direction: column; gap: 18px; }
    .pd-row { display: flex; align-items: center; gap: 14px; mat-icon { color: var(--teal); font-size: 20px; flex-shrink: 0; } label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; } span { font-size: 14.5px; color: var(--text-primary); } }
    .profile-actions { padding: 20px 28px; display: flex; gap: 10px; flex-wrap: wrap; }
  `]
})
export class ProfileComponent {
  constructor(public auth: AuthService, private toast: ToastService, private router: Router) {}
  getInitial() { return this.auth.currentUser()?.fullName?.charAt(0)?.toUpperCase() || 'U'; }
  logout() { this.auth.logout().subscribe({ next:()=>{ this.toast.success('Logged out!'); this.router.navigate(['/']); }, error:()=>{ this.auth.clearUser(); this.router.navigate(['/']); } }); }
}
