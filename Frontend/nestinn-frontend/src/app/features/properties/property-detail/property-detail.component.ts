import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property } from '../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

@Component({ selector: 'app-property-detail', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './property-detail.component.html', styleUrls: ['./property-detail.component.scss'] })
export class PropertyDetailComponent implements OnInit {
  propSvc = inject(PropertyService); auth = inject(AuthService);
  toast = inject(ToastService); router = inject(Router); route = inject(ActivatedRoute);
  property = signal<Property | null>(null); loading = signal(true);
  activeImg = 0; apiUrl = environment.apiUrl.replace('/api','');
  checkIn = ''; checkOut = ''; totalNights = 0; totalCost = 0; today = new Date().toISOString().split('T')[0];

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.propSvc.getById(id).subscribe({ 
  next: (res: any) => { 
    this.property.set(res.data || res); 
    this.loading.set(false); 
  }, 
  error: () => { 
    this.toast.error('Property not found'); 
    this.router.navigate(['/properties']); 
  } 
});
  }

  getImg(idx: number) {
  const p = this.property();

  if (p?.images && p.images.length > 0) {
    return p.images[idx];   // Cloudinary URL already
  }

  return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
}

  calcNights() {
    if (this.checkIn && this.checkOut) {
      const d = (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / 86400000;
      this.totalNights = d > 0 ? d : 0;
      this.totalCost = this.totalNights * (this.property()?.pricePerNight || 0);
    }
  }

  reserve() {
    if (!this.auth.isLoggedIn()) { this.toast.info('Please login to book'); this.router.navigate(['/auth/login']); return; }
    if (!this.checkIn || !this.checkOut || this.totalNights < 1) { this.toast.error('Please select valid dates'); return; }
    const p = this.property();
    if (!p) return;
    this.router.navigate(['/booking/new'], { queryParams: { propertyId: p.propertyId, checkIn: this.checkIn, checkOut: this.checkOut } });
  }

  getAmenities() { return this.property()?.amenities?.split(',').map(a => a.trim()) || []; }
}
