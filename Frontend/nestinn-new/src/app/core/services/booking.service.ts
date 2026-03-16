import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly API = `${environment.apiUrl}/booking`;
  constructor(private http: HttpClient) {}
  create(data: any): Observable<any> { return this.http.post<any>(this.API, data, { withCredentials: true }); }
  getMyBookings(): Observable<any> { return this.http.get<any>(`${this.API}/my-bookings`, { withCredentials: true }); }
  getOwnerBookings(): Observable<any> { return this.http.get<any>(`${this.API}/owner-bookings`, { withCredentials: true }); }
  getById(id: number): Observable<any> { return this.http.get<any>(`${this.API}/${id}`, { withCredentials: true }); }
  confirm(id: number): Observable<any> { return this.http.put(`${this.API}/${id}/confirm`, {}, { withCredentials: true }); }
  decline(id: number): Observable<any> { return this.http.put(`${this.API}/${id}/decline`, {}, { withCredentials: true }); }
  getUnavailableDates(propertyId: number): Observable<any> { return this.http.get<any>(`${environment.apiUrl}/booking/unavailable-dates/${propertyId}`); }
}
