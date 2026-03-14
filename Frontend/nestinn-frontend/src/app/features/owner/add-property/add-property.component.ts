import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ 
  selector: 'app-add-property', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './add-property.component.html', 
  styleUrls: ['./add-property.component.scss'] 
})
export class AddPropertyComponent {
  propSvc = inject(PropertyService); 
  toast = inject(ToastService); 
  router = inject(Router);
  loading = false; 
  selectedFiles: File[] = [];
  
  form = { 
    title: '', description: '', propertyType: 'Apartment', 
    location: '', city: '', pricePerNight: '', 
    checkInTime: '12:00 PM', checkOutTime: '11:00 AM', 
    amenities: '', nearestTransport: '', rules: '', isAvailable: true 
  };
  
  types = ['Apartment', 'Villa', 'House', 'Resort', 'Cottage', 'Penthouse', 'Studio'];
  amenityOptions = ['WiFi', 'AC', 'Pool', 'Parking', 'Kitchen', 'Garden', 'Beach Access', 'Gym', 'TV', 'Washer'];
  selectedAmenities: string[] = [];

  toggleAmenity(a: string) { 
    this.selectedAmenities = this.selectedAmenities.includes(a) 
      ? this.selectedAmenities.filter(x => x !== a) 
      : [...this.selectedAmenities, a]; 
  }

  onFiles(e: Event) { 
    const t = e.target as HTMLInputElement; 
    if (t.files) this.selectedFiles = Array.from(t.files).slice(0, 5); 
  }

  submit() {
    if (!this.form.title || !this.form.city || !this.form.pricePerNight) { 
      this.toast.error('Fill required fields'); return; 
    }
    this.loading = true;
    
    const propertyData = {
      title: this.form.title,
      description: this.form.description,
      propertyType: this.form.propertyType,
      location: this.form.location,
      city: this.form.city,
      pricePerNight: parseFloat(this.form.pricePerNight),
      checkInTime: this.form.checkInTime,
      checkOutTime: this.form.checkOutTime,
      amenities: this.selectedAmenities.join(', '),
      nearestTransport: this.form.nearestTransport,
      rules: this.form.rules,
      isAvailable: true
    };

    this.propSvc.create(propertyData).subscribe({
      next: (res: any) => { 
        this.toast.success('Property listed successfully!'); 
        if (this.selectedFiles.length > 0 && res.data?.propertyId) {

  this.selectedFiles.forEach((file: File) => {

    const fd = new FormData();
    fd.append("file", file);   // IMPORTANT

    this.propSvc.uploadImages(res.data.propertyId, fd)
      .subscribe({
        next: () => console.log("Image uploaded"),
        error: err => console.error(err)
      });

  });

}
        this.router.navigate(['/owner/properties']); 
      },
      error: (e: any) => { 
        this.toast.error(e.error?.message || 'Failed to create property'); 
        this.loading = false; 
      }
    });
  }
}