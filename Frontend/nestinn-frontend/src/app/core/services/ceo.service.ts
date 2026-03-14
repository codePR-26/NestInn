import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CeoService {

  private readonly API = `${environment.apiUrl}/ceo`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.API}/dashboard`, { withCredentials: true });
  }

  getEarnings(): Observable<any> {
    return this.http.get(`${this.API}/earnings`, { withCredentials: true });
  }

  withdraw(amount:number): Observable<any> {
    return this.http.post(`${this.API}/withdraw`, { amount }, { withCredentials: true });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.API}/users`, { withCredentials: true });
  }

  getProperties(): Observable<any> {
    return this.http.get(`${this.API}/properties`, { withCredentials: true });
  }

  getBookings(): Observable<any> {
    return this.http.get(`${this.API}/bookings`, { withCredentials: true });
  }

}