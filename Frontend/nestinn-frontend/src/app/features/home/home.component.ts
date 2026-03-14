import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({ 
  selector: 'app-home', 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterLink, PropertyCardComponent], 
  templateUrl: './home.component.html', 
  styleUrls: ['./home.component.scss'] 
})
export class HomeComponent implements OnInit {
  propService = inject(PropertyService); 
  router = inject(Router);
  topProperties = signal<any[]>([]);
  loading = signal(true);
  search = { city: '', checkIn: '', checkOut: '', type: '' };
  categories = ['All', 'Apartment', 'Villa', 'House', 'Resort', 'Cottage', 'Penthouse'];
  activeCategory = 'All';

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.propService.getTopRated().subscribe({
      next: (res: any) => { 
        const data = res.data || res || [];
        this.topProperties.set(data.slice(0, 8)); 
        this.loading.set(false); 
      },
      error: () => { 
        this.loading.set(false);
      }
    });
  }

  doSearch() {
    this.router.navigate(['/properties'], { queryParams: this.search });
  }

  filterByCategory(cat: string) {
    this.activeCategory = cat;
    this.propService.getAll().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        if (cat === 'All') this.topProperties.set(data.slice(0, 8));
        else this.topProperties.set(data.filter((p: any) => p.propertyType === cat).slice(0, 8));
      }
    });
  }
}