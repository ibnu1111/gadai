import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Gadai,
  PublicGadaiRequest,
  PublicGadaiResponse,
  TrackingResponse,
  Summary,
  Payment
} from '../models/gadai.model';

@Injectable({
  providedIn: 'root'
})
export class GadaiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(nama: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { nama, email, password });
  }

  // Admin Gadai
  getAllGadai(params?: {
    page?: number;
    limit?: number;
    status?: string;
    tanggalMulai?: string;
    tanggalAkhir?: string;
    search?: string;
  }): Observable<any> {
    return this.http.get(`${this.apiUrl}/gadai`, {
      headers: this.getHeaders(),
      params: params as any
    });
  }

  getGadaiById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/gadai/${id}`, {
      headers: this.getHeaders()
    });
  }

  createGadai(gadai: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gadai`, gadai, {
      headers: this.getHeaders()
    });
  }

  updateGadai(id: number, gadai: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/gadai/${id}`, gadai, {
      headers: this.getHeaders()
    });
  }

  updateGadaiStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/gadai/${id}/status`, { status }, {
      headers: this.getHeaders()
    });
  }

  deleteGadai(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/gadai/${id}`, {
      headers: this.getHeaders()
    });
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gadai/summary`, {
      headers: this.getHeaders()
    });
  }

  // Public Gadai
  createPublicGadai(request: PublicGadaiRequest): Observable<PublicGadaiResponse> {
    return this.http.post<PublicGadaiResponse>(`${this.apiUrl}/public/gadai`, request);
  }

  trackGadai(phone: string): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.apiUrl}/public/gadai/track`, {
      params: { phone }
    });
  }

  getPublicGadaiDetail(id: number, phone?: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/gadai/${id}`, {
      params: phone ? { phone } : {}
    });
  }

  // Payment
  processPayment(gadaiID: number, jumlahBayar: number, catatan?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment`, {
      gadaiID,
      jumlahBayar,
      catatan
    }, {
      headers: this.getHeaders()
    });
  }

  extendGadai(gadaiID: number, extensionPeriod: string, feePayment: number, newFee?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/extend`, {
      gadaiID,
      extensionPeriod,
      feePayment,
      newFee
    }, {
      headers: this.getHeaders()
    });
  }

  getPaymentHistory(gadaiId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/history/${gadaiId}`, {
      headers: this.getHeaders()
    });
  }

  // Customer
  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`, {
      headers: this.getHeaders()
    });
  }

  createCustomer(customer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, customer, {
      headers: this.getHeaders()
    });
  }
}
