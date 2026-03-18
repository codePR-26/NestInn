import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property } from '../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-owner-properties',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-properties.component.html',
  styleUrls: ['./owner-properties.component.scss']
})
export class OwnerPropertiesComponent implements OnInit {

  propSvc = inject(PropertyService);
  toast = inject(ToastService);
  router = inject(Router);

  properties = signal<Property[]>([]);
  loading = signal(true);

  apiUrl = environment.apiUrl.replace('/api','');

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.propSvc.getMyProperties().subscribe({
      next: res => {
        this.properties.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goEdit(id: number) {
    this.router.navigate(['/owner/edit-property', id]);
  }

  getImg(p: Property) {
    if (!p.images || p.images.length === 0) {
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&q=60';
    }
    return p.images[0];
  }

  onFileSelected(event: any, propertyId: number) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    this.propSvc.uploadImages(propertyId, formData).subscribe({
      next: () => {
        this.toast.success("Image uploaded successfully");
        this.loadProperties();
      },
      error: () => this.toast.error("Image upload failed")
    });
  }

  delete(id: number) {
    if (!confirm('Delete this property?')) return;
    this.propSvc.delete(id).subscribe({
      next: () => {
        this.toast.success('Property deleted');
        this.properties.update(ps => ps.filter(p => p.propertyId !== id));
      },
      error: () => this.toast.error('Failed to delete')
    });
  }
}