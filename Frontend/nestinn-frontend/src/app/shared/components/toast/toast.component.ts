import { Component, inject } from '@angular/core';
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
          <span>{{ t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️' }}</span>
          {{ t.message }}
        </div>
      }
    </div>
  `
})
export class ToastComponent { toast = inject(ToastService); }
