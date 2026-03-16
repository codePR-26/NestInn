import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-owner-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule],
  template: `
<div class="page-wrap">
  <div class="page-hero">
    <div class="container hero-row">
      <div>
        <h1>My Properties</h1>
        <p>{{ properties().length }} properties listed</p>
      </div>
      <a mat-flat-button routerLink="/owner/add-property" class="btn-teal">
        <mat-icon>add</mat-icon> Add Property
      </a>
    </div>
  </div>

  <div class="container" style="padding-top:36px;padding-bottom:60px">
    @if(loading()){
      <div class="ni-spinner"><mat-spinner diameter="48"></mat-spinner></div>
    } @else if(properties().length === 0){
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <h3>No properties yet</h3>
        <p>Add your first property and start earning!</p>
        <a mat-flat-button routerLink="/owner/add-property" class="btn-teal">
          <mat-icon>add</mat-icon> Add Property
        </a>
      </div>
    } @else {
      <div class="prop-grid">
        @for(p of properties(); track p.propertyId){
          <div class="prop-card">
            <div class="pc-img">
              <img [src]="getImg(p)" [alt]="p.title" loading="lazy"/>
              <div class="pc-overlay"></div>
              <div class="pc-type">{{ p.propertyType }}</div>
              <div class="pc-avail" [class.unavail]="!p.isAvailable">
                {{ p.isAvailable ? 'Available' : 'Unavailable' }}
              </div>
            </div>
            <div class="pc-body">
              <div class="pc-city">📍 {{ p.city }}</div>
              <div class="pc-title">{{ p.title }}</div>
              @if(p.amenities){
                <div class="pc-amenities">
                  @for(a of p.amenities.split(',').slice(0,3); track a){
                    <span class="am-chip">{{ a.trim() }}</span>
                  }
                </div>
              }
              <div class="pc-footer">
                <span class="pc-price">
                  ₹{{ p.pricePerNight | number }}<small>/night</small>
                </span>
                @if(p.rating > 0){
                  <span class="pc-rating">★ {{ p.rating | number:'1.1-1' }}</span>
                }
              </div>
              <div class="pc-actions">
                <a mat-stroked-button
                   [routerLink]="['/properties', p.propertyId]"
                   style="border-color:var(--teal);color:var(--teal);border-radius:8px;flex:1;text-decoration:none">
                  <mat-icon>visibility</mat-icon> View
                </a>
                <a mat-flat-button
                   [routerLink]="['/owner/add-property']"
                   [queryParams]="{edit: p.propertyId}"
                   class="btn-teal"
                   style="flex:1;text-decoration:none">
                  <mat-icon>edit</mat-icon> Edit
                </a>
                <button mat-icon-button color="warn"
                  matTooltip="Delete property"
                  (click)="delete(p.propertyId)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>`,
  styles: [`
    .hero-row {
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .prop-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 22px;
    }
    .prop-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    }
    .pc-img {
      position: relative; height: 190px; overflow: hidden;
      background: var(--surface2);
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
      &:hover img { transform: scale(1.04); }
    }
    .pc-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%);
    }
    .pc-type {
      position: absolute; top: 10px; left: 10px;
      background: var(--teal); color: #fff;
      font-size: 10px; font-weight: 700;
      padding: 3px 9px; border-radius: 4px;
    }
    [data-theme="dark"] .pc-type { color: #0a2020; }
    .pc-avail {
      position: absolute; top: 10px; right: 10px;
      background: rgba(39,174,96,0.9); color: #fff;
      font-size: 10px; font-weight: 600;
      padding: 3px 9px; border-radius: 4px;
      &.unavail { background: rgba(231,76,60,0.9); }
    }
    .pc-body { padding: 14px; }
    .pc-city { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .pc-title {
      font-size: 14.5px; font-weight: 700; color: var(--text-primary);
      margin-bottom: 8px; line-height: 1.35;
    }
    .pc-amenities { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .am-chip {
      background: var(--teal-subtle); color: var(--teal);
      font-size: 10.5px; font-weight: 500;
      padding: 2px 8px; border-radius: 50px;
    }
    .pc-footer {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 12px;
    }
    .pc-price {
      font-family: 'Playfair Display', serif; font-size: 17px;
      color: var(--teal); font-weight: 700;
      small { font-size: 11px; color: var(--text-muted); font-family: 'DM Sans', sans-serif; font-weight: 400; }
    }
    .pc-rating { font-size: 12px; color: #e6a817; font-weight: 600; }
    .pc-actions { display: flex; gap: 8px; align-items: center; }
    @media(max-width: 600px) {
      .pc-actions { flex-wrap: wrap; }
    }
  `]
})
export class OwnerPropertiesComponent implements OnInit {
  properties = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private propService: PropertyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.propService.getMyProperties().subscribe({
      next: (r: any) => {
        this.properties.set(r.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getImg(p: any): string {
    return p.images?.[0] || `https://picsum.photos/seed/${p.propertyId}/400/260`;
  }

  delete(id: number) {
    if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
    this.propService.delete(id).subscribe({
      next: () => {
        this.toast.success('Property deleted successfully');
        this.properties.update(ps => ps.filter(p => p.propertyId !== id));
      },
      error: (e: any) => this.toast.error(e.error?.message || 'Delete failed')
    });
  }
}
