import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
<div class="auth-page">
  <div class="auth-left">
    <div class="auth-brand">
      <a routerLink="/" class="auth-logo">Nest<strong>Inn</strong></a>
      <h1>One last step to<br/><em>get started</em></h1>
      <p>We sent a 6-digit OTP to <strong style="color:#4ecdc4">{{ email }}</strong>. Enter it below to verify your account.</p>
    </div>
  </div>
  <div class="auth-right">
    <div class="auth-card" style="text-align:center">
      <div style="font-size:48px;margin-bottom:16px">📧</div>
      <h2>Verify Your Email</h2>
      <p class="auth-sub">Enter the 6-digit code sent to {{ email }}</p>
      <div class="otp-inputs">
        @for(i of [0,1,2,3,4,5]; track i) {
          <input type="text" maxlength="1" [(ngModel)]="digits[i]" [id]="'otp'+i"
            (input)="onInput(i, $event)" (keydown)="onKeyDown(i, $event)" />
        }
      </div>
      <button mat-flat-button class="btn-teal w-full submit-btn" (click)="submit()" [disabled]="loading">
        @if(loading){<mat-spinner diameter="20"></mat-spinner>}
        @else{<mat-icon>verified</mat-icon> Verify Email}
      </button>
      <div class="resend-row" style="margin-top:16px">
        Didn't get the code? <button (click)="resend()">Resend OTP</button>
      </div>
    </div>
  </div>
</div>`,
  styleUrls: ['../login/auth.shared.scss']
})
export class VerifyOtpComponent implements OnInit {
  email = ''; digits = ['','','','','','']; loading = false;
  constructor(private auth: AuthService, private toast: ToastService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit() { this.route.queryParams.subscribe(p => { if (p['email']) this.email = p['email']; }); }
  onInput(i: number, e: any) {
    const v = e.target.value.replace(/\D/g,'');
    this.digits[i] = v.charAt(0);
    if (v && i < 5) { const next = document.getElementById('otp'+(i+1)); next?.focus(); }
  }
  onKeyDown(i: number, e: KeyboardEvent) {
    if (e.key==='Backspace' && !this.digits[i] && i>0) { const prev = document.getElementById('otp'+(i-1)); prev?.focus(); }
  }
  submit() {
    const code = this.digits.join('');
    if (code.length < 6) { this.toast.error('Enter all 6 digits'); return; }
    this.loading = true;
    this.auth.verifyOtp({ email: this.email, otpCode: code }).subscribe({
      next: () => { this.loading=false; this.toast.success('Email verified! Please log in.'); this.router.navigate(['/auth/login']); },
      error: (err: any) => { this.loading=false; this.toast.error(err.error?.message || 'Invalid OTP'); }
    });
  }
  resend() {
    this.auth.resendOtp(this.email).subscribe({
      next: () => this.toast.success('New OTP sent!'),
      error: () => this.toast.error('Failed to resend OTP')
    });
  }
}
