import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { Booking } from '../../../core/models/booking.model';

@Component({ selector: 'app-my-bookings', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './my-bookings.component.html', styleUrls: ['./my-bookings.component.scss'] })
export class MyBookingsComponent implements OnInit {
  bookingSvc = inject(BookingService); toast = inject(ToastService);
  bookings = signal<Booking[]>([]); loading = signal(true); activeTab = 'all';

  ngOnInit() {
    this.bookingSvc.getMyBookings().subscribe({
      next: (res: any) => { 
        const data = res.data || res || [];
        this.bookings.set(Array.isArray(data) ? data : [data]); 
        this.loading.set(false); 
      },
      error: () => this.loading.set(false)
    });
  }

  filtered() {
    const b = this.bookings();
    if (this.activeTab === 'all') return b;
    return b.filter(x => x.bookingStatus.toLowerCase() === this.activeTab);
  }

  statusClass(s: string) {
    const m: Record<string,string> = { 'Confirmed': 'badge-green', 'Pending': 'badge-gold', 'Declined': 'badge-red', 'Cancelled': 'badge-red', 'Completed': 'badge-teal' };
    return m[s] || 'badge-gray';
  }
}
