import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { Booking } from '../../../core/models/booking.model';
import { Property } from '../../../core/models/property.model';

@Component({ selector: 'app-owner-dashboard', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './owner-dashboard.component.html', styleUrls: ['./owner-dashboard.component.scss'] })
export class OwnerDashboardComponent implements OnInit {
  bookingSvc = inject(BookingService); propSvc = inject(PropertyService); toast = inject(ToastService);
  bookings = signal<Booking[]>([]); properties = signal<Property[]>([]); loading = signal(true);

  ngOnInit() {
   this.propSvc.getMyProperties().subscribe({
  next: (res: any) => this.properties.set(res.data || []),
  error: () => {}
});

this.bookingSvc.getOwnerBookings().subscribe({
  next: (res: any) => {
    this.bookings.set(res.data || []);
    this.loading.set(false);
  },
  error: () => this.loading.set(false)
});
  }

  get totalRevenue() {
  return this.bookings().filter(b => (b.paymentStatus as any) === 'Success').reduce((s, b) => s + b.ownerAmount, 0);}
  get pendingBookings() { return this.bookings().filter(b => b.bookingStatus === 'Pending').length; }
  get confirmedBookings() { return this.bookings().filter(b => b.bookingStatus === 'Confirmed').length; }

  confirm(id: number) {
    this.bookingSvc.confirm(id).subscribe({ next: () => { this.toast.success('Booking confirmed'); this.bookings.update(bs => bs.map(b => b.bookingId === id ? {...b, bookingStatus: 'Confirmed'} : b)); }, error: () => this.toast.error('Failed to confirm') });
  }

  decline(id: number) {
    this.bookingSvc.decline(id).subscribe({ next: () => { this.toast.info('Booking declined'); this.bookings.update(bs => bs.map(b => b.bookingId === id ? {...b, bookingStatus: 'Declined'} : b)); }, error: () => this.toast.error('Failed to decline') });
  }

  statusClass(s: string) { const m: Record<string,string> = {'Confirmed':'badge-green','Pending':'badge-gold','Declined':'badge-red','Completed':'badge-teal'}; return m[s]||'badge-gray'; }
}
