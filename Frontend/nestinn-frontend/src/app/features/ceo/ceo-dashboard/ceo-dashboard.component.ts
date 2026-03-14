import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeoService } from '../../../core/services/ceo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-ceo-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ceo-dashboard.component.html',
  styleUrls: ['./ceo-dashboard.component.scss']
})
export class CeoDashboardComponent implements OnInit {

  ceoSvc = inject(CeoService);
  toast = inject(ToastService);

  dashboard = signal<any>(null);
  earnings = signal<any>(null);

  users = signal<any[]>([]);
  properties = signal<any[]>([]);
  bookings = signal<any[]>([]);

  activeTab = 'overview';
  loading = signal(true);
  withdrawing = false;

  ngOnInit() {

    this.ceoSvc.getDashboard().subscribe({
      next:(res:any)=> this.dashboard.set(res.data)
    });

    this.ceoSvc.getEarnings().subscribe({
      next:(res:any)=>{
        this.earnings.set(res.data);
        this.loading.set(false);
      }
    });

    this.ceoSvc.getUsers().subscribe({
      next:(res:any)=> this.users.set(res.data)
    });

    this.ceoSvc.getProperties().subscribe({
      next:(res:any)=> this.properties.set(res.data)
    });

    this.ceoSvc.getBookings().subscribe({
      next:(res:any)=> this.bookings.set(res.data)
    });

  }

  withdraw() {

    const e = this.earnings();

    if(!e || e.pendingWithdrawal <= 0){
      this.toast.info('No pending earnings');
      return;
    }

    this.withdrawing = true;

    this.ceoSvc.withdraw(e.pendingWithdrawal).subscribe({

      next:()=>{

        this.toast.success("Withdrawal successful");

        this.ceoSvc.getDashboard().subscribe({
          next:(res:any)=>this.dashboard.set(res.data)
        });

        this.ceoSvc.getEarnings().subscribe({
          next:(res:any)=>this.earnings.set(res.data)
        });

        this.withdrawing=false;
      },

      error:()=>{
        this.toast.error("Withdrawal failed");
        this.withdrawing=false;
      }

    });

  }

}