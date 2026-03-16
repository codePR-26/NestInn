import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CeoService } from '../../../core/services/ceo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-ceo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  templateUrl: './ceo-dashboard.component.html',
  styleUrls: ['./ceo-dashboard.component.scss']
})
export class CeoDashboardComponent implements OnInit {
  dashboard = signal<any>(null);
  earnings = signal<any>(null);
  users = signal<any[]>([]);
  properties = signal<any[]>([]);
  bookings = signal<any[]>([]);
  loading = signal(true);
  withdrawAmount = 0; withdrawing = false;
  userCols = ['id','name','email','role','verified','joined'];
  propCols = ['id','title','city','type','price','rating','available'];
  bookCols = ['id','user','property','date','amount','status','payment'];

  constructor(private ceoService: CeoService, private toast: ToastService) {}

  ngOnInit() {
    this.ceoService.getDashboard().subscribe({ next:(r:any)=>{ this.dashboard.set(r.data); this.loading.set(false); }, error:()=>this.loading.set(false) });
    this.ceoService.getEarnings().subscribe({ next:(r:any)=>this.earnings.set(r.data) });
    this.ceoService.getUsers().subscribe({ next:(r:any)=>this.users.set(r.data||[]) });
    this.ceoService.getProperties().subscribe({ next:(r:any)=>this.properties.set(r.data||[]) });
    this.ceoService.getBookings().subscribe({ next:(r:any)=>this.bookings.set(r.data||[]) });
  }

  withdraw() {
    if (!this.withdrawAmount || this.withdrawAmount <= 0) { this.toast.error('Enter a valid amount'); return; }
    this.withdrawing = true;
    this.ceoService.withdraw(this.withdrawAmount).subscribe({
      next:(r:any)=>{ this.withdrawing=false; this.toast.success(r.message||'Withdrawal successful!'); this.ngOnInit(); this.withdrawAmount=0; },
      error:(e:any)=>{ this.withdrawing=false; this.toast.error(e.error?.message||'Withdrawal failed'); }
    });
  }
}
