import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDividerModule, MatTooltipModule],
  template: `
<footer class="footer">
  <div class="footer-main">
    <div class="footer-inner">

      <!-- Brand -->
      <div class="footer-brand">
        <a routerLink="/" class="footer-logo">Nest<strong>Inn</strong></a>
        <p>India's premium property rental platform. Discover unique stays across the country with verified hosts.</p>
        <div class="social-links">
          <button mat-icon-button class="social-btn" matTooltip="Twitter/X">
            <mat-icon>alternate_email</mat-icon>
          </button>
          <button mat-icon-button class="social-btn" matTooltip="Instagram">
            <mat-icon>photo_camera</mat-icon>
          </button>
          <button mat-icon-button class="social-btn" matTooltip="LinkedIn">
            <mat-icon>work</mat-icon>
          </button>
          <button mat-icon-button class="social-btn" matTooltip="YouTube">
            <mat-icon>play_circle</mat-icon>
          </button>
        </div>
      </div>

      <!-- Explore -->
      <div class="footer-col">
        <h4>Explore</h4>
        <a routerLink="/properties">Browse All Properties</a>
        <a routerLink="/properties">Villas</a>
        <a routerLink="/properties">Apartments</a>
        <a routerLink="/properties">Cottages</a>
        <a routerLink="/properties">Studios</a>
      </div>

      <!-- Account -->
      <div class="footer-col">
        <h4>Account</h4>
        @if(!auth.isLoggedIn()) {
          <a routerLink="/auth/login">Sign In</a>
          <a routerLink="/auth/register">Create Account</a>
          <a routerLink="/auth/register">Become a Host</a>
        } @else {
          <a routerLink="/profile">My Profile</a>
          @if(!auth.isCeo()) {
            <a routerLink="/bookings">My Bookings</a>
          }
          @if(auth.isOwner()) {
            <a routerLink="/owner/dashboard">Owner Dashboard</a>
            <a routerLink="/owner/properties">My Properties</a>
            <a routerLink="/owner/add-property">Add Property</a>
          }
          @if(auth.isCeo()) {
            <a routerLink="/ceo/dashboard">CEO Dashboard</a>
          }
        }
      </div>

      <!-- Support -->
      <div class="footer-col">
        <h4>Support</h4>
        <a routerLink="/">Help Center</a>
        <a routerLink="/">Safety Information</a>
        <a routerLink="/">Cancellation Policy</a>
        <a href="mailto:prithmid@gmail.com">Contact Us</a>
        <a routerLink="/">Report an Issue</a>
      </div>

    </div>
  </div>

  <mat-divider></mat-divider>

  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <span>© 2026 NestInn, Inc. All rights reserved.</span>
      <div class="footer-bottom-links">
        <a routerLink="/">Privacy Policy</a>
        <a routerLink="/">Terms of Service</a>
        <a routerLink="/">Cookie Settings</a>
      </div>
    </div>
  </div>
</footer>
  `,
  styles: [`
    .footer {
      background: var(--footer-bg);
      border-top: 1px solid rgba(255,255,255,0.06);
      font-family: 'DM Sans', sans-serif;
    }
    .footer-main { padding: 56px 0 40px; }
    .footer-inner {
      max-width: 1320px; margin: 0 auto; padding: 0 28px;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
    }
    .footer-logo {
      font-family: 'Playfair Display', serif; font-size: 26px;
      color: #4ecdc4; text-decoration: none; display: block; margin-bottom: 14px;
      strong { color: #fff; }
    }
    .footer-brand p { color: rgba(255,255,255,0.4); font-size: 13.5px; line-height: 1.7; max-width: 260px; margin-bottom: 18px; }
    .social-links { display: flex; gap: 4px; }
    .social-btn { color: rgba(255,255,255,0.35) !important; transition: color 0.2s !important;
      &:hover { color: #4ecdc4 !important; }
    }
    .footer-col h4 {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: rgba(255,255,255,0.5);
      margin-bottom: 18px;
    }
    .footer-col a {
      display: block; color: rgba(255,255,255,0.4); font-size: 13.5px;
      text-decoration: none; margin-bottom: 10px; transition: color 0.2s;
      &:hover { color: #4ecdc4; }
    }
    .footer-bottom { padding: 18px 0; }
    .footer-bottom-inner {
      max-width: 1320px; margin: 0 auto; padding: 0 28px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .footer-bottom-inner > span { font-size: 13px; color: rgba(255,255,255,0.25); }
    .footer-bottom-links {
      display: flex; gap: 20px;
      a { color: rgba(255,255,255,0.25); font-size: 13px; text-decoration: none; transition: color 0.2s; &:hover { color: #4ecdc4; } }
    }
    mat-divider { border-top-color: rgba(255,255,255,0.06) !important; }
    @media (max-width: 900px) {
      .footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
      .footer-brand { grid-column: 1 / -1; }
    }
    @media (max-width: 480px) {
      .footer-inner { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {
  constructor(public auth: AuthService) {}
}
