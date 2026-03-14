import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, SendMessageRequest } from '../models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {

  private readonly API = `${environment.apiUrl}/message`;

  constructor(private http: HttpClient) {}

  send(data: SendMessageRequest): Observable<any> {
    return this.http.post<any>(`${this.API}/send`, data, { withCredentials: true });
  }

  getByBooking(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${bookingId}`, { withCredentials: true });
  }

  markRead(messageId: number): Observable<any> {
    return this.http.put(`${this.API}/read/${messageId}`, {}, { withCredentials: true });
  }
}