import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property } from '../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

@Component({ selector: 'app-booking-form', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './booking-form.component.html', styleUrls: ['./booking-form.component.scss'] })
export class BookingFormComponent implements OnInit {
  bookingSvc = inject(BookingService); propSvc = inject(PropertyService);
  paymentSvc = inject(PaymentService); toast = inject(ToastService);
  router = inject(Router); route = inject(ActivatedRoute);
  property = signal<Property | null>(null);
  checkIn = ''; checkOut = ''; loading = false; step = 1;
  apiUrl = environment.apiUrl.replace('/api','');

  get nights() {
    if (!this.checkIn || !this.checkOut) return 0;
    return Math.max(0, (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / 86400000);
  }
  get subtotal() { return this.nights * (this.property()?.pricePerNight || 0); }
  get fee() { return this.subtotal * 0.1; }
  get total() { return this.subtotal + this.fee; }
  getImg() { const p = this.property(); if (p?.images?.[0]) return this.apiUrl + p.images[0].imageUrl; return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80'; }

  ngOnInit() {
    const q = this.route.snapshot.queryParams;
    this.checkIn = q['checkIn']; this.checkOut = q['checkOut'];
    const id = +q['propertyId'];
   this.propSvc.getById(id).subscribe({ 
  next: (res: any) => this.property.set(res.data || res), 
  error: () => { this.toast.error('Property not found'); this.router.navigate(['/properties']); } 
});
  }

  proceedToPayment() { this.step = 2; }

  confirmPayment() {
    const p = this.property();
    if (!p) return;
    this.loading = true;
    this.bookingSvc.create({ propertyId: p.propertyId, checkInDate: this.checkIn, checkOutDate: this.checkOut }).subscribe({
      next: (res: any) => {
  const booking = res.data || res;
  this.paymentSvc.confirm(booking.bookingId, 'DUMMY_PAY_' + Date.now()).subscribe({
          next: () => { this.step = 3; this.loading = false; },
          error: () => { this.step = 3; this.loading = false; }
        });
      },
      error: (e: any) => { this.toast.error(e.error?.message || 'Booking failed'); this.loading = false; }
    });
  }
}
