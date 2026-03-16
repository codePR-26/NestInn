import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule, MatDividerModule],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  property = signal<any>(null);
  loading = signal(true);
  activeImg = 0;
  checkIn = ''; checkOut = ''; totalNights = 0;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private propService: PropertyService,
    public auth: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.propService.getById(+p['id']).subscribe({
        next: (r: any) => { this.property.set(r.data); this.loading.set(false); },
        error: () => { this.loading.set(false); this.router.navigate(['/properties']); }
      });
    });
  }

  getImg(i: number): string {
    const imgs = this.property()?.images;
    if (imgs?.length > i) return imgs[i];
    return `https://picsum.photos/seed/${(this.property()?.propertyId || 1) + i}/800/500`;
  }

  getAmenities(): string[] {
    const a = this.property()?.amenities;
    return a ? a.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
  }

  calcNights() {
    if (this.checkIn && this.checkOut) {
      const d = (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / 86400000;
      this.totalNights = d > 0 ? Math.round(d) : 0;
    }
  }

  reserve() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please login to book a property');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.auth.isRenter()) {
      this.toast.error('Only renters can book properties');
      return;
    }
    if (!this.checkIn || !this.checkOut || this.totalNights <= 0) {
      this.toast.error('Please select valid check-in and check-out dates');
      return;
    }
    this.router.navigate(['/booking/new'], {
      queryParams: {
        propertyId: this.property().propertyId,
        checkIn: this.checkIn,
        checkOut: this.checkOut
      }
    });
  }
}
