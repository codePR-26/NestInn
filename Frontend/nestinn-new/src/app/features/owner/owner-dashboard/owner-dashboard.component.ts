import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDividerModule],
  template: `
<div class="page-wrap">
  <div class="page-hero"><div class="container"><h1>Owner Dashboard</h1><p>Manage your properties and incoming bookings</p></div></div>
  <div class="container dash-wrap">

    <div class="stat-grid">
      <div class="stat-card">
        <div class="sc-icon teal"><mat-icon>home</mat-icon></div>
        <div><strong>{{ properties().length }}</strong><span>Properties</span></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon gold"><mat-icon>pending</mat-icon></div>
        <div><strong>{{ pending }}</strong><span>Pending</span></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon green"><mat-icon>check_circle</mat-icon></div>
        <div><strong>{{ confirmed }}</strong><span>Confirmed</span></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon blue"><mat-icon>currency_rupee</mat-icon></div>
        <div><strong>₹{{ revenue | number:'1.0-0' }}</strong><span>Revenue</span></div>
      </div>
    </div>

    <div class="quick-actions">
      <a mat-flat-button routerLink="/owner/add-property" class="btn-teal">
        <mat-icon>add_home</mat-icon> Add New Property
      </a>
      <a mat-stroked-button routerLink="/owner/properties" style="border-color:var(--teal);color:var(--teal);border-radius:8px">
        <mat-icon>home</mat-icon> View All Properties
      </a>
    </div>

    <div class="section-block">
      <div class="sec-header"><div class="sec-title">Recent Bookings</div></div>
      @if(loading()){ <div class="ni-spinner"><mat-spinner diameter="40"></mat-spinner></div> }
      @else if(bookings().length === 0){
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No bookings yet</h3>
          <p>Bookings will appear here when guests book your properties.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="bookings().slice(0,15)" class="ni-table">
            <ng-container matColumnDef="guest">
              <th mat-header-cell *matHeaderCellDef>Guest</th>
              <td mat-cell *matCellDef="let b">
                <div class="guest-cell">
                  <div class="g-avatar">{{ (b.userName||'G').charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="g-name">{{ b.userName || 'Guest #'+b.userId }}</div>
                    <div class="g-email">{{ b.userEmail || '' }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="property">
              <th mat-header-cell *matHeaderCellDef>Property</th>
              <td mat-cell *matCellDef="let b">{{ b.propertyTitle || '#'+b.propertyId }}</td>
            </ng-container>
            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Dates</th>
              <td mat-cell *matCellDef="let b">
                <small>{{ b.checkInDate | date:'dd MMM' }} → {{ b.checkOutDate | date:'dd MMM yy' }}</small>
              </td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let b"><strong>₹{{ b.totalAmount | number:'1.0-0' }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <span [class]="'badge badge-'+badge(b.bookingStatus)">{{ b.bookingStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let b">
                @if(b.bookingStatus==='Pending'){
                  <button mat-icon-button matTooltip="Confirm booking" (click)="confirm(b.bookingId)" style="color:#27ae60">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Decline booking" (click)="decline(b.bookingId)" color="warn">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
                @if(b.bookingStatus==='Confirmed'){
                  <a mat-icon-button [routerLink]="['/chat',b.bookingId]" matTooltip="Chat with guest">
                    <mat-icon style="color:var(--teal)">chat</mat-icon>
                  </a>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </div>
      }
    </div>
  </div>
</div>`,
  styles: [`
    .dash-wrap { padding:36px 0 60px; }
    .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px; display:flex; align-items:center; gap:16px; }
    .sc-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sc-icon.teal { background:rgba(78,205,196,0.15); mat-icon{color:var(--teal);} }
    .sc-icon.gold { background:rgba(230,168,23,0.15); mat-icon{color:var(--gold);} }
    .sc-icon.green { background:rgba(39,174,96,0.15); mat-icon{color:#27ae60;} }
    .sc-icon.blue { background:rgba(93,173,226,0.15); mat-icon{color:#5dade2;} }
    .stat-card strong { display:block; font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:var(--text-primary); }
    .stat-card span { font-size:13px; color:var(--text-muted); }
    .quick-actions { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap; }
    .section-block { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px; }
    .table-wrap { overflow-x:auto; margin-top:16px; }
    .ni-table { width:100%; }
    .guest-cell { display:flex; align-items:center; gap:10px; }
    .g-avatar { width:32px; height:32px; border-radius:50%; background:var(--teal); color:#0a2020; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; }
    .g-name { font-size:13.5px; font-weight:600; color:var(--text-primary); }
    .g-email { font-size:11.5px; color:var(--text-muted); }
    @media(max-width:768px) { .stat-grid{grid-template-columns:1fr 1fr;} }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  bookings = signal<any[]>([]);
  properties = signal<any[]>([]);
  loading = signal(true);
  cols = ['guest','property','dates','amount','status','actions'];
  get pending() { return this.bookings().filter(b => b.bookingStatus==='Pending').length; }
  get confirmed() { return this.bookings().filter(b => b.bookingStatus==='Confirmed').length; }
  get revenue() { return this.bookings().filter(b => b.paymentStatus==='Success'||b.paymentStatus==='Paid').reduce((s,b)=>s+b.ownerAmount,0); }
  constructor(private bookingService: BookingService, private propService: PropertyService, private toast: ToastService) {}
  ngOnInit() {
    this.propService.getMyProperties().subscribe({ next:(r:any)=>this.properties.set(r.data||[]), error:()=>{} });
    this.bookingService.getOwnerBookings().subscribe({ next:(r:any)=>{this.bookings.set(r.data||[]);this.loading.set(false);}, error:()=>this.loading.set(false) });
  }
  badge(s: string) { return s==='Confirmed'?'green':s==='Declined'?'red':s==='Pending'?'gold':'gray'; }
  confirm(id: number) { this.bookingService.confirm(id).subscribe({ next:()=>{this.toast.success('Booking confirmed!');this.reload();}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  decline(id: number) { this.bookingService.decline(id).subscribe({ next:()=>{this.toast.info('Booking declined');this.reload();}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  reload() { this.bookingService.getOwnerBookings().subscribe({next:(r:any)=>this.bookings.set(r.data||[])}); }
}
