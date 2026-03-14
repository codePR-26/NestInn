import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ selector: 'app-verify-otp', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './verify-otp.component.html', styleUrls: ['./verify-otp.component.scss'] })
export class VerifyOtpComponent implements OnInit {
  auth = inject(AuthService); toast = inject(ToastService);
  router = inject(Router); route = inject(ActivatedRoute);
  email = ''; otp = ''; loading = false; resendLoading = false; countdown = 0;

  ngOnInit() { this.email = this.route.snapshot.queryParams['email'] || ''; this.startCountdown(); }

  startCountdown() { this.countdown = 60; const t = setInterval(() => { this.countdown--; if (this.countdown <= 0) clearInterval(t); }, 1000); }

  submit() {
    if (this.otp.length !== 6) { this.toast.error('Enter the 6-digit OTP'); return; }
    this.loading = true;
    this.auth.verifyOtp({ email: this.email, otpCode: this.otp }).subscribe({
      next: (res: any) => {
        this.toast.success('Email verified! Welcome to NestInn 🎉');
        const role = res.user?.role;
        if (role === 'Owner') this.router.navigate(['/owner/dashboard']);
        else this.router.navigate(['/']);
      },
      error: (e: any) => { this.toast.error(e.error?.message || 'Invalid OTP'); this.loading = false; }
    });
  }

  resend() {
    this.resendLoading = true;
    this.auth.resendOtp(this.email).subscribe({
      next: () => { this.toast.success('New OTP sent!'); this.startCountdown(); this.resendLoading = false; },
      error: () => { this.toast.error('Failed to resend'); this.resendLoading = false; }
    });
  }
}
