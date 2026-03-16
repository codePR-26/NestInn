import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = `${environment.apiUrl}/payment`;
  constructor(private http: HttpClient) {}
  initiate(data: any): Observable<any> { return this.http.post(`${this.API}/initiate`, data, { withCredentials: true }); }
  confirm(data: any): Observable<any> { return this.http.post(`${this.API}/confirm-payment`, data, { withCredentials: true }); }
  refund(bookingId: number): Observable<any> { return this.http.post(`${this.API}/refund/${bookingId}`, {}, { withCredentials: true }); }
  getInvoice(bookingId: number): Observable<Blob> { return this.http.get(`${this.API}/invoice/${bookingId}`, { responseType: 'blob', withCredentials: true }); }
}
