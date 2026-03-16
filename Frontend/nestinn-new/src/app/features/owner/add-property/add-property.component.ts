import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatDividerModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.scss']
})
export class AddPropertyComponent implements OnInit {
  form: any = {
    title: '', description: '', propertyType: '', location: '', city: '',
    pricePerNight: '', checkInTime: '', checkOutTime: '',
    nearestTransport: '', amenities: '', rules: ''
  };
  loading = false;
  editId: number | null = null;
  createdId: number | null = null;
  uploadedImgs: Record<number, string> = {};

  constructor(
    private propService: PropertyService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['edit']) {
        this.editId = +p['edit'];
        this.propService.getById(this.editId).subscribe({
          next: (r: any) => {
            const d = r.data;
            this.form = {
              title: d.title, description: d.description || '',
              propertyType: d.propertyType, location: d.location,
              city: d.city, pricePerNight: d.pricePerNight,
              checkInTime: d.checkInTime, checkOutTime: d.checkOutTime,
              nearestTransport: d.nearestTransport || '',
              amenities: d.amenities || '', rules: d.rules || ''
            };
            this.createdId = this.editId;
          }
        });
      }
    });
  }

  submit() {
    if (!this.form.title || !this.form.propertyType || !this.form.city || !this.form.pricePerNight) {
      this.toast.error('Please fill all required fields');
      return;
    }
    this.loading = true;
    const obs = this.editId
      ? this.propService.update(this.editId, this.form)
      : this.propService.create(this.form);
    obs.subscribe({
      next: (r: any) => {
        this.loading = false;
        if (!this.editId) {
          this.createdId = r.data?.propertyId;
          this.toast.success('Property created! You can now upload images below.');
        } else {
          this.toast.success('Property updated successfully!');
          this.router.navigate(['/owner/properties']);
        }
      },
      error: (e: any) => {
        this.loading = false;
        this.toast.error(e.error?.message || 'Something went wrong');
      }
    });
  }

  uploadImg(event: any, order: number) {
    const file = event.target.files[0];
    if (!file || !this.createdId) return;
    this.propService.uploadImage(this.createdId, file, order).subscribe({
      next: (r: any) => {
        this.uploadedImgs[order] = r.data;
        this.toast.success(`Image ${order} uploaded!`);
      },
      error: () => this.toast.error('Image upload failed')
    });
  }
}
