import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ 
  selector: 'app-add-property', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './add-property.component.html', 
  styleUrls: ['./add-property.component.scss'] 
})
export class AddPropertyComponent implements OnInit {
  propSvc = inject(PropertyService); 
  toast = inject(ToastService); 
  router = inject(Router);
  route = inject(ActivatedRoute);
  loading = false; 
  selectedFiles: File[] = [];
  editId: number | null = null;
  
  form = { 
    title: '', description: '', propertyType: 'Apartment', 
    location: '', city: '', pricePerNight: '', 
    checkInTime: '12:00 PM', checkOutTime: '11:00 AM', 
    amenities: '', nearestTransport: '', rules: '', isAvailable: true 
  };
  
  types = ['Apartment', 'Villa', 'House', 'Resort', 'Cottage', 'Penthouse', 'Studio'];
  amenityOptions = ['WiFi', 'AC', 'Pool', 'Parking', 'Kitchen', 'Garden', 'Beach Access', 'Gym', 'TV', 'Washer'];
  selectedAmenities: string[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = +id;
      this.loadProperty(this.editId);
    }
  }

  loadProperty(id: number) {
    this.loading = true;
    this.propSvc.getById(id).subscribe({
      next: (res: any) => {
        const p = res.data || res;
        this.form.title = p.title;
        this.form.description = p.description;
        this.form.propertyType = p.propertyType;
        this.form.location = p.location;
        this.form.city = p.city;
        this.form.pricePerNight = p.pricePerNight;
        this.form.checkInTime = p.checkInTime;
        this.form.checkOutTime = p.checkOutTime;
        this.form.nearestTransport = p.nearestTransport || '';
        this.form.rules = p.rules || '';
        this.form.isAvailable = p.isAvailable;
        this.selectedAmenities = p.amenities 
          ? p.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
          : [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load property');
        this.loading = false;
      }
    });
  }

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
      isAvailable: this.form.isAvailable
    };

    if (this.editId) {
      this.propSvc.update(this.editId, propertyData).subscribe({
        next: () => { 
          this.toast.success('Property updated successfully!'); 
          this.router.navigate(['/owner/properties']); 
        },
        error: (e: any) => { 
          this.toast.error(e.error?.message || 'Failed to update property'); 
          this.loading = false; 
        }
      });
    } else {
      this.propSvc.create(propertyData).subscribe({
        next: (res: any) => { 
          this.toast.success('Property listed successfully!'); 
          if (this.selectedFiles.length > 0 && res.data?.propertyId) {
            this.selectedFiles.forEach((file: File) => {
              const fd = new FormData();
              fd.append("file", file);
              this.propSvc.uploadImages(res.data.propertyId, fd).subscribe({
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
}