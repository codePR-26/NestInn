import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly API = `${environment.apiUrl}/property`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> { return this.http.get<any>(this.API); }
  getTopRated(): Observable<any> { return this.http.get<any>(`${this.API}/top-rated`); }
  getById(id: number): Observable<any> { return this.http.get<any>(`${this.API}/${id}`); }
  search(params: any): Observable<any> { return this.http.post<any>(`${this.API}/search`, params); }
  getMyProperties(): Observable<any> { return this.http.get<any>(`${this.API}/my-properties`, { withCredentials: true }); }
  create(data: any): Observable<any> { return this.http.post<any>(this.API, data, { withCredentials: true }); }
  update(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.API}/${id}`, data, { withCredentials: true }); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.API}/${id}`, { withCredentials: true }); }
  uploadImage(id: number, file: File, order: number): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.API}/${id}/images?order=${order}`, fd, { withCredentials: true });
  }
}
