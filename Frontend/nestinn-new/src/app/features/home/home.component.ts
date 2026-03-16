import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../core/services/property.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatCardModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  topProperties = signal<any[]>([]);
  loading = signal(true);
  activeCategory = 'All';
  categories = ['All', 'Villa', 'Apartment', 'Cottage', 'Studio', 'Hostel', 'Beach', 'Mountain'];
  search = { city: '', checkIn: '', checkOut: '', type: '' };

  whyItems = [
    { icon: '🔒', title: 'Verified Properties', desc: 'Every listing is verified for quality and safety standards.' },
    { icon: '💬', title: 'Direct Chat', desc: 'Talk directly with owners after booking — no middlemen.' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'Fixed 10% platform fee. No hidden charges ever.' },
    { icon: '⭐', title: 'Trusted Reviews', desc: 'Real reviews from verified guests only.' },
    { icon: '🚀', title: 'Instant Booking', desc: 'Book in seconds, confirmation in minutes.' },
    { icon: '🛡️', title: 'Secure Payments', desc: 'All transactions are safe and protected.' }
  ];

  constructor(private propService: PropertyService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.propService.getTopRated().subscribe({
      next: (res: any) => { this.topProperties.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onCategoryChange(e: any) {
    this.activeCategory = e.value || 'All';
  }

  doSearch() {
    const q: any = {};
    if (this.search.city) q['city'] = this.search.city;
    if (this.search.checkIn) q['checkInDate'] = this.search.checkIn;
    if (this.search.checkOut) q['checkOutDate'] = this.search.checkOut;
    if (this.search.type) q['propertyType'] = this.search.type;
    this.router.navigate(['/properties'], { queryParams: q });
  }

  goToProperty(id: number) { this.router.navigate(['/properties', id]); }

  getImg(p: any): string {
    return p.images?.[0] || `https://picsum.photos/seed/${p.propertyId}/400/260`;
  }
}
