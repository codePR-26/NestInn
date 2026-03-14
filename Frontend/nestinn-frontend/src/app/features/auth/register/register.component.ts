import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ selector: 'app-register', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './register.component.html', styleUrls: ['./register.component.scss'] })
export class RegisterComponent {
  auth = inject(AuthService); toast = inject(ToastService); router = inject(Router);
  form = { fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Renter' as 'Renter' | 'Owner' };
  loading = false; showPass = false;

  submit() {
    if (Object.values(this.form).some(v => !v)) { this.toast.error('Please fill all fields'); return; }
    if (this.form.password !== this.form.confirmPassword) { this.toast.error('Passwords do not match'); return; }
    if (this.form.password.length < 8) { this.toast.error('Password must be at least 8 characters'); return; }
    this.loading = true;
    const { confirmPassword, ...data } = this.form;
    this.auth.register(data).subscribe({
      next: () => {
        this.toast.success('OTP sent to your email!');
        this.router.navigate(['/auth/verify-otp'], { queryParams: { email: this.form.email } });
      },
      error: (e: any) => { this.toast.error(e.error?.message || 'Registration failed'); this.loading = false; }
    });
  }
}
