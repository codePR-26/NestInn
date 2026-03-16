import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
<div class="auth-page">
  <div class="auth-left">
    <div class="auth-brand">
      <a routerLink="/" class="auth-logo">Nest<strong>Inn</strong></a>
      <h1>Start your hosting<br/><em>or travel journey</em></h1>
      <p>Whether you're looking for a place to stay or want to earn by renting your property — NestInn has you covered.</p>
      <div class="role-cards">
        <div class="role-card" [class.active]="form.role==='Renter'" (click)="form.role='Renter'">
          <span class="rc-icon">🧳</span>
          <div><strong>I'm a Renter</strong><small>Find & book amazing stays</small></div>
        </div>
        <div class="role-card" [class.active]="form.role==='Owner'" (click)="form.role='Owner'">
          <span class="rc-icon">🏠</span>
          <div><strong>I'm a Host</strong><small>List & earn from properties</small></div>
        </div>
      </div>
    </div>
  </div>
  <div class="auth-right">
    <div class="auth-card">
      <h2>Create Account</h2>
      <p class="auth-sub">Join NestInn today — it's free</p>
      <div class="role-toggle">
        <button [class.active]="form.role==='Renter'" (click)="form.role='Renter'" type="button">🧳 Renter</button>
        <button [class.active]="form.role==='Owner'" (click)="form.role='Owner'" type="button">🏠 Host / Owner</button>
      </div>
      <form (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Name</mat-label>
          <input matInput [(ngModel)]="form.fullName" name="fullName" required placeholder="Arjun Sharma"/>
          <mat-icon matPrefix>person</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" [(ngModel)]="form.email" name="email" required/>
          <mat-icon matPrefix>email</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone Number</mat-label>
          <input matInput [(ngModel)]="form.phone" name="phone" required placeholder="+91 98765 43210"/>
          <mat-icon matPrefix>phone</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Password</mat-label>
          <input matInput [type]="showPass?'text':'password'" [(ngModel)]="form.password" name="password" required/>
          <mat-icon matPrefix>lock</mat-icon>
          <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass">
            <mat-icon>{{ showPass?'visibility_off':'visibility' }}</mat-icon>
          </button>
        </mat-form-field>
        <button mat-flat-button type="submit" class="btn-teal w-full submit-btn" [disabled]="loading">
          @if(loading){<mat-spinner diameter="20"></mat-spinner>}
          @else{<mat-icon>person_add</mat-icon> Create Account}
        </button>
      </form>
      <div class="auth-divider"><span>or</span></div>
      <p class="auth-link">Already have an account? <a routerLink="/auth/login">Sign in →</a></p>
    </div>
  </div>
</div>`,
  styleUrls: ['../login/auth.shared.scss']
})
export class RegisterComponent {
  form = { fullName:'', email:'', phone:'', password:'', role:'Renter' as 'Renter'|'Owner' };
  showPass = false; loading = false;
  constructor(private auth: AuthService, private toast: ToastService, private router: Router) {}
  submit() {
    const { fullName, email, phone, password, role } = this.form;
    if (!fullName||!email||!phone||!password) { this.toast.error('Please fill all fields'); return; }
    this.loading = true;
    this.auth.register({ fullName, email, phone, password, role }).subscribe({
      next: () => { this.loading=false; this.toast.success('Registration successful! Check your email for OTP.'); this.router.navigate(['/auth/verify-otp'], { queryParams: { email } }); },
      error: (err: any) => { this.loading=false; this.toast.error(err.error?.message || 'Registration failed'); }
    });
  }
}
