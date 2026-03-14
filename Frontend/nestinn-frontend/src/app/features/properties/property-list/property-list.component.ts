import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit {

  propSvc = inject(PropertyService);
  route = inject(ActivatedRoute);

  properties = signal<any[]>([]);
  loading = signal(true);

  filters = {
    city: '',
    checkIn: '',
    checkOut: '',
    propertyType: '',
    minPrice: '',
    maxPrice: ''
  };

  types = ['All', 'Apartment', 'Villa', 'House', 'Resort', 'Cottage', 'Penthouse'];

  sortBy = 'rating';

  ngOnInit() {

    const q = this.route.snapshot.queryParams;

    if (q['city']) this.filters.city = q['city'];
    if (q['checkIn']) this.filters.checkIn = q['checkIn'];
    if (q['checkOut']) this.filters.checkOut = q['checkOut'];

    this.load();
  }

  load() {

    this.loading.set(true);

    this.propSvc.getAll().subscribe({

      next: (res: any) => {

        let data = res.data || res || [];

        // CITY FILTER
        if (this.filters.city) {
          data = data.filter((p:any) =>
            p.city?.toLowerCase().includes(this.filters.city.toLowerCase())
          );
        }

        // PROPERTY TYPE FILTER
        if (this.filters.propertyType) {
          data = data.filter((p:any) =>
            p.propertyType === this.filters.propertyType
          );
        }

        // MIN PRICE FILTER
        if (this.filters.minPrice) {
          data = data.filter((p:any) =>
            p.pricePerNight >= Number(this.filters.minPrice)
          );
        }

        // MAX PRICE FILTER
        if (this.filters.maxPrice) {
          data = data.filter((p:any) =>
            p.pricePerNight <= Number(this.filters.maxPrice)
          );
        }

        this.properties.set(this.sort(data));

        this.loading.set(false);

      },

      error: () => this.loading.set(false)

    });
  }

  sort(p:any[]) {

    if (this.sortBy === 'rating')
      return [...p].sort((a,b) => b.rating - a.rating);

    if (this.sortBy === 'price-asc')
      return [...p].sort((a,b) => a.pricePerNight - b.pricePerNight);

    if (this.sortBy === 'price-desc')
      return [...p].sort((a,b) => b.pricePerNight - a.pricePerNight);

    return p;
  }

  onSortChange() {
    this.properties.update(p => this.sort(p));
  }

  reset() {

    this.filters = {
      city: '',
      checkIn: '',
      checkOut: '',
      propertyType: '',
      minPrice: '',
      maxPrice: ''
    };

    this.load();
  }

}