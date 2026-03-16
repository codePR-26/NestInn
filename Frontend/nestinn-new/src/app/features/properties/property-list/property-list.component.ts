import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatProgressSpinnerModule, MatSliderModule, MatExpansionModule],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit {
  properties = signal<any[]>([]);
  loading = signal(true);
  filters = { city:'', propertyType:'', checkIn:'', checkOut:'', minPrice: null as any, maxPrice: null as any };
  sortBy = 'rating';
  types = ['', 'Villa', 'Apartment', 'Cottage', 'Studio', 'Hostel'];

  constructor(private propService: PropertyService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['city']) this.filters.city = p['city'];
      if (p['checkInDate']) this.filters.checkIn = p['checkInDate'];
      if (p['checkOutDate']) this.filters.checkOut = p['checkOutDate'];
      if (p['propertyType']) this.filters.propertyType = p['propertyType'];
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    const hasFilters = this.filters.city || this.filters.propertyType || this.filters.checkIn || this.filters.checkOut || this.filters.minPrice || this.filters.maxPrice;
    const obs = hasFilters
      ? this.propService.search({ city: this.filters.city||undefined, propertyType: this.filters.propertyType||undefined, checkInDate: this.filters.checkIn||undefined, checkOutDate: this.filters.checkOut||undefined, minPrice: this.filters.minPrice||undefined, maxPrice: this.filters.maxPrice||undefined })
      : this.propService.getAll();
    obs.subscribe({ next: (r:any) => { this.properties.set(r.data||[]); this.sortProps(); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  reset() { this.filters = { city:'', propertyType:'', checkIn:'', checkOut:'', minPrice:null, maxPrice:null }; this.load(); }

  sortProps() {
    this.properties.update(ps => [...ps].sort((a,b) =>
      this.sortBy==='price-asc' ? a.pricePerNight-b.pricePerNight :
      this.sortBy==='price-desc' ? b.pricePerNight-a.pricePerNight :
      (b.rating||0)-(a.rating||0)));
  }

  getImg(p: any): string { return p.images?.[0] || `https://picsum.photos/seed/${p.propertyId}/400/260`; }
  go(id: number) { this.router.navigate(['/properties', id]); }
}
