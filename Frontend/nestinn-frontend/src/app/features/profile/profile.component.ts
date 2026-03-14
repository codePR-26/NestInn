import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './profile.component.html', styleUrls: ['./profile.component.scss'] })
export class ProfileComponent implements OnInit {
  auth = inject(AuthService); toast = inject(ToastService); http = inject(HttpClient);
  form = { fullName: '', phone: '' }; loading = false;

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) { this.form.fullName = u.fullName; this.form.phone = u.phone; }
  }

  save() {
    this.loading = true;
    this.http.put(`${environment.apiUrl}/auth/profile`, this.form, { withCredentials: true }).subscribe({
      next: () => { this.toast.success('Profile updated'); this.loading = false; },
      error: () => { this.toast.error('Update failed'); this.loading = false; }
    });
  }
}
