import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for(t of toast.toasts(); track t.id) {
        <div class="toast toast-{{t.type}}" (click)="toast.remove(t.id)">
          <span class="toast-icon">
            @if(t.type==='success'){✓}
            @else if(t.type==='error'){✕}
            @else{ℹ}
          </span>
          <span>{{t.message}}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position:fixed; bottom:28px; right:28px; z-index:9998; display:flex; flex-direction:column; gap:10px; }
    .toast {
      display:flex; align-items:center; gap:10px;
      padding:13px 18px; border-radius:10px; color:#fff;
      font-size:13.5px; font-weight:500; cursor:pointer;
      animation:slideUp 0.3s ease; min-width:260px; max-width:380px;
      box-shadow:0 8px 24px rgba(0,0,0,0.25);
    }
    .toast-success { background:#0d4f4f; border-left:4px solid #4ecdc4; }
    .toast-error   { background:#4a0f0f; border-left:4px solid #e74c3c; }
    .toast-info    { background:#1a2a4a; border-left:4px solid #5dade2; }
    .toast-icon { font-size:16px; flex-shrink:0; }
    @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  `]
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
