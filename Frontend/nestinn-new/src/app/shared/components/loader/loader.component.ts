import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" [class.hidden]="hidden">
      <div class="loader-content">
        <div class="logo-loader">
          <span class="logo-text">Nest<strong>Inn</strong></span>
        </div>
        <div class="dots-loader">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <p class="loader-tagline">Finding your perfect stay...</p>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: var(--loader-bg, #0a1a1a);
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.6s ease, visibility 0.6s ease;
    }
    .loader-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
    .loader-content { text-align: center; }
    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 42px; color: #4ecdc4; letter-spacing: -1px;
      display: block; margin-bottom: 32px;
      animation: pulse 1.5s ease-in-out infinite;
    }
    .logo-text strong { color: #fff; }
    .dots-loader { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    .dots-loader span {
      width: 10px; height: 10px; border-radius: 50%;
      background: #4ecdc4; animation: bounce 1.2s ease-in-out infinite;
    }
    .dots-loader span:nth-child(1) { animation-delay: 0s; }
    .dots-loader span:nth-child(2) { animation-delay: 0.15s; }
    .dots-loader span:nth-child(3) { animation-delay: 0.3s; }
    .dots-loader span:nth-child(4) { animation-delay: 0.45s; }
    .dots-loader span:nth-child(5) { animation-delay: 0.6s; }
    .loader-tagline { color: rgba(255,255,255,0.4); font-size: 13px; letter-spacing: 1px; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.7; }
    }
  `]
})
export class LoaderComponent implements OnInit {
  hidden = false;
  ngOnInit() {
    setTimeout(() => { this.hidden = true; }, 2200);
  }
}
