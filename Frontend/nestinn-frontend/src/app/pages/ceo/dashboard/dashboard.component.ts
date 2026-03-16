import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  dashboard: any = null;
  earnings: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboard();
    this.loadEarnings();
  }

  loadDashboard() {
    this.http.get('http://localhost:5103/api/ceo/dashboard', { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          this.dashboard = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  loadEarnings() {
    this.http.get('http://localhost:5103/api/ceo/earnings', { withCredentials: true })
      .subscribe({
        next: (res: any) => { this.earnings = res.data; },
        error: () => {}
      });
  }

  withdraw() {
    this.http.post('http://localhost:5103/api/ceo/withdraw', {}, { withCredentials: true })
      .subscribe({
        next: () => { alert('Withdrawal successful!'); this.loadEarnings(); },
        error: () => { alert('Withdrawal failed!'); }
      });
  }
}