import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ selector: 'app-login', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './login.component.html', styleUrls: ['./login.component.scss'] })
export class LoginComponent {
  auth = inject(AuthService); toast = inject(ToastService); router = inject(Router);
  email = ''; password = ''; loading = false; showPass = false;

  submit() {
    if (!this.email || !this.password) { this.toast.error('Please fill all fields'); return; }
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.toast.success('Welcome back!');
        const role = res.user?.role;
        if (role === 'CEO') this.router.navigate(['/ceo/dashboard']);
        else if (role === 'Owner') this.router.navigate(['/owner/dashboard']);
        else this.router.navigate(['/']);
      },
      error: (e: any) => { this.toast.error(e.error?.message || 'Invalid credentials'); this.loading = false; }
    });
  }
}
