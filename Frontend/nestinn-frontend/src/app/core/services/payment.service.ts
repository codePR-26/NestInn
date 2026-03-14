import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = `${environment.apiUrl}/payment`;
  constructor(private http: HttpClient) {}

  initiate(bookingId: number, amount: number): Observable<any> {
    return this.http.post(`${this.API}/initiate-payment`, { bookingId, amount }, { withCredentials: true });
  }

  confirm(bookingId: number, paymentId: string): Observable<any> {
    return this.http.post(`${this.API}/confirm-payment`, { bookingId, transactionId: paymentId }, { withCredentials: true });
  }

  getInvoice(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.API}/invoice/${bookingId}`, { responseType: 'blob', withCredentials: true });
  }
}