import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  scrolled = false;
  menuOpen = false;

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private toast: ToastService,
    private router: Router
  ) {}

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  logout() {
    this.auth.logout().subscribe({
      next: () => { this.toast.success('Logged out successfully!'); this.router.navigate(['/']); },
      error: () => { this.auth.clearUser(); this.router.navigate(['/']); }
    });
  }

  getInitial() {
    return this.auth.currentUser()?.fullName?.charAt(0)?.toUpperCase() || 'U';
  }
}
