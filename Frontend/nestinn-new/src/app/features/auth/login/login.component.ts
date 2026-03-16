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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
<div class="auth-page">
  <div class="auth-left">
    <div class="auth-brand">
      <a routerLink="/" class="auth-logo">Nest<strong>Inn</strong></a>
      <h1>Welcome back to your<br/><em>perfect stay</em></h1>
      <p>Sign in to manage bookings, chat with hosts, and discover amazing properties across India.</p>
      <div class="auth-stats">
        <div class="as-item"><strong>50K+</strong><span>Properties</span></div>
        <div class="as-item"><strong>200K+</strong><span>Happy Guests</span></div>
        <div class="as-item"><strong>4.9★</strong><span>Avg Rating</span></div>
      </div>
    </div>
  </div>
  <div class="auth-right">
    <div class="auth-card">
      <h2>Sign In</h2>
      <p class="auth-sub">Continue your journey with NestInn</p>
      <form (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com"/>
          <mat-icon matPrefix>email</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Password</mat-label>
          <input matInput [type]="showPass?'text':'password'" [(ngModel)]="password" name="password" required/>
          <mat-icon matPrefix>lock</mat-icon>
          <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass">
            <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>
        <button mat-flat-button type="submit" class="btn-teal w-full submit-btn" [disabled]="loading">
          @if(loading) { <mat-spinner diameter="20"></mat-spinner> }
          @else { <mat-icon>login</mat-icon> Sign In }
        </button>
      </form>
      <div class="auth-divider"><span>or</span></div>
      <p class="auth-link">New to NestInn? <a routerLink="/auth/register">Create an account →</a></p>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./auth.shared.scss']
})
export class LoginComponent {
  email = ''; password = ''; showPass = false; loading = false;
  constructor(private auth: AuthService, private toast: ToastService, private router: Router) {}
  submit() {
    if (!this.email || !this.password) { this.toast.error('Please fill all fields'); return; }
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toast.success('Welcome back!');
        const role = res.data?.role;
        if (role === 'CEO') this.router.navigate(['/ceo/dashboard']);
        else if (role === 'Owner') this.router.navigate(['/owner/dashboard']);
        else this.router.navigate(['/']);
      },
      error: (err: any) => { this.loading = false; this.toast.error(err.error?.message || 'Login failed'); }
    });
  }
}
