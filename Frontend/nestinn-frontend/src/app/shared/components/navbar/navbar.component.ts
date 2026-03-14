import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);
  scrolled = false;
  menuOpen = false;
  profileOpen = false;

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.profileOpen = false;
    }
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
  }

  logout() {
    this.profileOpen = false;
    this.auth.logout().subscribe({
      next: () => { 
        this.toast.success('Logged out successfully'); 
        this.router.navigate(['/auth/login']); 
      },
      error: () => { 
        this.auth.clearUser(); 
        this.router.navigate(['/auth/login']); 
      }
    });
  }
}