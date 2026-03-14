import { Injectable, signal } from '@angular/core';
export interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private id = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 3500) {
    const t: Toast = { id: ++this.id, message, type };
    this.toasts.update(ts => [...ts, t]);
    setTimeout(() => this.remove(t.id), duration);
  }
  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
  remove(id: number) { this.toasts.update(ts => ts.filter(t => t.id !== id)); }
}
