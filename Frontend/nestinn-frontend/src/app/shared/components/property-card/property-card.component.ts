import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {

  @Input() property!: Property;

  getImage() {
    if (this.property.images && this.property.images.length > 0) {
      return this.property.images[0];   // Cloudinary URL
    }

    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';
  }

  getStars(r: number) {
    return '⭐'.repeat(Math.round(r));
  }
}