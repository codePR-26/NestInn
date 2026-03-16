import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatStepperModule, MatCardModule, MatDividerModule],
  template: `
<div class="page-wrap">
  <div class="page-hero"><div class="container"><h1>Complete Your Booking</h1><p>Secure your perfect stay</p></div></div>
  <div class="container booking-layout">
    @if(loading()){ <div class="ni-spinner"><mat-spinner diameter="48"></mat-spinner></div> }
    @else if(property()) {
      <div class="booking-main">
        <mat-stepper orientation="horizontal" [selectedIndex]="step" class="booking-stepper">
          <mat-step label="Review">
            <div class="step-content">
              <h3>Property Details</h3>
              <div class="prop-summary">
                <img [src]="getImg()" [alt]="property().title" class="prop-img"/>
                <div>
                  <div class="prop-type badge badge-teal">{{ property().propertyType }}</div>
                  <h4>{{ property().title }}</h4>
                  <p>📍 {{ property().location }}, {{ property().city }}</p>
                  <p>Check-in: <strong>{{ checkIn }}</strong> &nbsp;→&nbsp; Check-out: <strong>{{ checkOut }}</strong></p>
                  <p>Nights: <strong>{{ nights }}</strong></p>
                </div>
              </div>
              <mat-divider style="margin:20px 0"></mat-divider>
              <div class="price-rows">
                <div class="pb-row"><span>₹{{ property().pricePerNight | number }} × {{ nights }} nights</span><span>₹{{ property().pricePerNight * nights | number }}</span></div>
                <div class="pb-row"><span>Platform fee (10%)</span><span>₹{{ (property().pricePerNight * nights * 0.1) | number:'1.0-0' }}</span></div>
                <mat-divider></mat-divider>
                <div class="pb-row total"><span>Total Amount</span><span>₹{{ (property().pricePerNight * nights * 1.1) | number:'1.0-0' }}</span></div>
              </div>
              <button mat-flat-button class="btn-teal next-btn" (click)="createBooking()" [disabled]="booking_loading">
                @if(booking_loading){<mat-spinner diameter="20"></mat-spinner>}@else{Proceed to Payment →}
              </button>
            </div>
          </mat-step>
          <mat-step label="Payment">
            <div class="step-content">
              <h3>Payment Details</h3>
              <p style="color:var(--text-muted);margin-bottom:20px">This is a simulated payment for demo purposes.</p>
              <mat-form-field appearance="outline" class="w-full"><mat-label>Card Holder Name</mat-label><input matInput [(ngModel)]="card.holder" placeholder="Arjun Sharma"/><mat-icon matPrefix>person</mat-icon></mat-form-field>
              <mat-form-field appearance="outline" class="w-full"><mat-label>Card Number</mat-label><input matInput [(ngModel)]="card.number" placeholder="4111 1111 1111 1111" maxlength="16"/><mat-icon matPrefix>credit_card</mat-icon></mat-form-field>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <mat-form-field appearance="outline" class="w-full"><mat-label>Expiry (MM/YY)</mat-label><input matInput [(ngModel)]="card.expiry" placeholder="12/27"/></mat-form-field>
                <mat-form-field appearance="outline" class="w-full"><mat-label>CVV</mat-label><input matInput [(ngModel)]="card.cvv" maxlength="3" placeholder="123" type="password"/></mat-form-field>
              </div>
              <div class="total-chip">Total: ₹{{ booking()?.totalAmount | number }}</div>
              <button mat-flat-button class="btn-teal next-btn" (click)="pay()" [disabled]="pay_loading">
                @if(pay_loading){<mat-spinner diameter="20"></mat-spinner>}@else{<mat-icon>lock</mat-icon> Pay Now}
              </button>
            </div>
          </mat-step>
          <mat-step label="Confirmed">
            <div class="step-content success-step">
              <div class="success-icon">✅</div>
              <h3>Booking Confirmed!</h3>
              <p>Your payment was successful. Invoice has been sent to your email.</p>
              <p>Booking ID: <strong>#{{ booking()?.bookingId }}</strong></p>
              <div style="display:flex;gap:12px;justify-content:center;margin-top:24px">
                <a mat-flat-button class="btn-teal" routerLink="/bookings">My Bookings</a>
                <button mat-stroked-button (click)="getInvoice()">📄 Download Invoice</button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    }
  </div>
</div>`,
  styles: [`
    .booking-layout { padding: 36px 0 60px; max-width: 700px; }
    .booking-main { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
    .booking-stepper { background: transparent !important; }
    .step-content { padding: 24px 28px; }
    h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--text-primary); margin-bottom: 20px; }
    .prop-summary { display: flex; gap: 16px; align-items: flex-start; }
    .prop-img { width: 100px; height: 80px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
    .prop-summary h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 6px 0; }
    .prop-summary p { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
    .price-rows { display: flex; flex-direction: column; gap: 10px; }
    .pb-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-secondary); &.total { font-weight: 700; font-size: 16px; color: var(--text-primary); padding-top: 10px; } }
    .next-btn { width: 100% !important; height: 48px !important; font-size: 15px !important; font-weight: 700 !important; border-radius: 10px !important; margin-top: 20px !important; display: flex !important; align-items: center !important; gap: 8px !important; justify-content: center !important; }
    .w-full { width: 100% !important; }
    .total-chip { background: var(--teal-subtle); color: var(--teal); font-size: 16px; font-weight: 700; padding: 10px 16px; border-radius: 8px; margin: 8px 0; text-align: center; }
    .success-step { text-align: center; padding: 40px 28px; }
    .success-icon { font-size: 56px; margin-bottom: 16px; }
    .success-step h3 { color: var(--teal); }
    .success-step p { color: var(--text-muted); margin-bottom: 8px; }
  `]
})
export class BookingFormComponent implements OnInit {
  property = signal<any>(null);
  booking = signal<any>(null);
  loading = signal(true);
  booking_loading = false; pay_loading = false;
  checkIn = ''; checkOut = ''; nights = 0; step = 0;
  card = { holder: '', number: '4111111111111111', expiry: '12/27', cvv: '123' };

  constructor(private propService: PropertyService, private bookingService: BookingService,
    private payService: PaymentService, private toast: ToastService,
    private route: ActivatedRoute, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.checkIn = p['checkIn'] || ''; this.checkOut = p['checkOut'] || '';
      if (this.checkIn && this.checkOut) this.nights = Math.round((new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / 86400000);
      if (p['propertyId']) {
        this.propService.getById(+p['propertyId']).subscribe({ next: (r: any) => { this.property.set(r.data); this.loading.set(false); }, error: () => { this.loading.set(false); this.router.navigate(['/properties']); } });
      } else { this.loading.set(false); this.router.navigate(['/properties']); }
    });
  }

  getImg() { const p = this.property(); return p?.images?.[0] || `https://picsum.photos/seed/${p?.propertyId}/400/260`; }

  createBooking() {
    this.booking_loading = true;
    this.bookingService.create({ propertyId: this.property().propertyId, checkInDate: this.checkIn, checkOutDate: this.checkOut }).subscribe({
      next: (r: any) => { this.booking.set(r.data); this.booking_loading = false; this.step = 1; },
      error: (e: any) => { this.booking_loading = false; this.toast.error(e.error?.message || 'Booking failed'); }
    });
  }

  pay() {
    this.pay_loading = true;
    this.payService.initiate({ bookingId: this.booking().bookingId, amount: this.booking().totalAmount, cardHolder: this.card.holder, cardNumber: this.card.number, expiry: this.card.expiry, cvv: this.card.cvv }).subscribe({
      next: () => { this.pay_loading = false; this.step = 2; this.toast.success('Payment successful! Invoice sent to your email.'); },
      error: (e: any) => { this.pay_loading = false; this.toast.error(e.error?.message || 'Payment failed'); }
    });
  }

  getInvoice() {
    this.payService.getInvoice(this.booking().bookingId).subscribe({ next: (blob: Blob) => { const url = URL.createObjectURL(blob); window.open(url); }, error: () => this.toast.error('Could not fetch invoice') });
  }
}
