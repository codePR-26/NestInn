import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, RouterModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
<div class="page-wrap">
  <div class="page-hero"><div class="container"><h1>My Bookings</h1><p>Track and manage all your stays</p></div></div>
  <div class="container" style="padding-top:36px;padding-bottom:60px">
    @if(loading()){ <div class="ni-spinner"><mat-spinner diameter="48"></mat-spinner></div> }
    @else if(bookings().length === 0){
      <div class="empty-state">
        <div class="empty-icon">🗓️</div>
        <h3>No bookings yet</h3>
        <p>Start exploring properties and make your first booking!</p>
        <a mat-flat-button routerLink="/properties" class="btn-teal">Browse Properties</a>
      </div>
    } @else {
      <mat-tab-group class="booking-tabs">
        <mat-tab label="All">
          <div class="booking-cards">@for(b of bookings(); track b.bookingId){ <ng-container *ngTemplateOutlet="bkCard; context:{b:b}"></ng-container> }</div>
        </mat-tab>
        <mat-tab label="Pending">
          <div class="booking-cards">@for(b of getByStatus('Pending'); track b.bookingId){ <ng-container *ngTemplateOutlet="bkCard; context:{b:b}"></ng-container> }</div>
        </mat-tab>
        <mat-tab label="Confirmed">
          <div class="booking-cards">@for(b of getByStatus('Confirmed'); track b.bookingId){ <ng-container *ngTemplateOutlet="bkCard; context:{b:b}"></ng-container> }</div>
        </mat-tab>
        <mat-tab label="Completed">
          <div class="booking-cards">@for(b of getCompleted(); track b.bookingId){ <ng-container *ngTemplateOutlet="bkCard; context:{b:b}"></ng-container> }</div>
        </mat-tab>
      </mat-tab-group>
    }
  </div>
</div>

<ng-template #bkCard let-b="b">
  <div class="bk-card">
    <div class="bk-header">
      <div>
        <div class="bk-title">{{ b.propertyTitle || 'Property #' + b.propertyId }}</div>
        <div class="bk-city">📍 {{ b.propertyCity || 'India' }}</div>
      </div>
      <div class="bk-id">#{{ b.bookingId }}</div>
    </div>
    <div class="bk-dates">
      <div class="bk-date"><mat-icon>login</mat-icon><div><label>Check-in</label><strong>{{ b.checkInDate | date:'mediumDate' }}</strong></div></div>
      <div class="bk-arrow">→</div>
      <div class="bk-date"><mat-icon>logout</mat-icon><div><label>Check-out</label><strong>{{ b.checkOutDate | date:'mediumDate' }}</strong></div></div>
      <div class="bk-nights"><strong>{{ b.totalNights }}</strong><span>nights</span></div>
    </div>
    <div class="bk-footer">
      <div class="bk-amounts">
        <span class="bk-amount">₹{{ b.totalAmount | number }}</span>
        <span [class]="'badge badge-'+payBadge(b.paymentStatus)">{{ b.paymentStatus }}</span>
        <span [class]="'badge badge-'+statusBadge(b.bookingStatus)">{{ b.bookingStatus }}</span>
      </div>
      <div class="bk-actions">
        @if(b.paymentStatus==='Pending' && b.bookingStatus!=='Declined'){
          <a mat-flat-button class="btn-teal" [routerLink]="['/booking/new']" [queryParams]="{propertyId:b.propertyId,checkIn:b.checkInDate,checkOut:b.checkOutDate}">
            <mat-icon>payment</mat-icon> Pay Now
          </a>
        }
        @if(b.paymentStatus==='Success' || b.paymentStatus==='Paid'){
          <a mat-stroked-button [routerLink]="['/chat', b.bookingId]" style="color:var(--teal);border-color:var(--teal);border-radius:8px">
            <mat-icon>chat</mat-icon> Chat
          </a>
          <button mat-icon-button (click)="getInvoice(b.bookingId)" matTooltip="Download Invoice">
            <mat-icon>receipt</mat-icon>
          </button>
        }
      </div>
    </div>
  </div>
</ng-template>`,
  styles: [`
    .booking-tabs { margin-top: 8px; }
    .booking-cards { display:flex; flex-direction:column; gap:16px; padding:24px 0; }
    .bk-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px 22px; transition:box-shadow 0.2s; &:hover{box-shadow:var(--shadow-md);} }
    .bk-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
    .bk-title { font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px; }
    .bk-city { font-size:13px; color:var(--text-muted); }
    .bk-id { font-size:12px; color:var(--text-muted); background:var(--surface2); padding:4px 10px; border-radius:50px; }
    .bk-dates { display:flex; align-items:center; gap:16px; background:var(--surface2); border-radius:10px; padding:14px 16px; margin-bottom:16px; flex-wrap:wrap; }
    .bk-date { display:flex; align-items:center; gap:8px; mat-icon{color:var(--teal);font-size:18px;} label{display:block;font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;} strong{font-size:14px;color:var(--text-primary);font-weight:600;} }
    .bk-arrow { font-size:18px; color:var(--text-muted); }
    .bk-nights { margin-left:auto; text-align:center; strong{display:block;font-family:'Playfair Display',serif;font-size:22px;color:var(--teal);font-weight:700;} span{font-size:11px;color:var(--text-muted);} }
    .bk-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .bk-amounts { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .bk-amount { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:var(--text-primary); }
    .bk-actions { display:flex; gap:8px; align-items:center; }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  loading = signal(true);
  constructor(private bookingService: BookingService, private payService: PaymentService, private toast: ToastService, private router: Router) {}
  ngOnInit() {
    this.bookingService.getMyBookings().subscribe({
      next: (r: any) => { this.bookings.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  getByStatus(s: string) { return this.bookings().filter(b => b.bookingStatus === s); }
  getCompleted() { return this.bookings().filter(b => b.paymentStatus === 'Success' || b.paymentStatus === 'Paid'); }
  statusBadge(s: string) { return s==='Confirmed'?'green':s==='Declined'||s==='Cancelled'?'red':s==='Pending'?'gold':'gray'; }
  payBadge(s: string) { return (s==='Success'||s==='Paid')?'green':s==='Refunded'?'teal':s==='Failed'?'red':'gold'; }
  getInvoice(id: number) {
    this.payService.getInvoice(id).subscribe({
      next: (b: Blob) => { const url = URL.createObjectURL(b); window.open(url); },
      error: () => this.toast.error('Invoice not available')
    });
  }
}
