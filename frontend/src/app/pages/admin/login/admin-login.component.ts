import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GadaiService } from '../../../services/gadai.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login Admin</h2>
        <p class="subtitle">Gadai Service Management</p>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              class="form-control"
              placeholder="admin@email.com"
              required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              class="form-control"
              placeholder="Password"
              required>
          </div>

          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Loading...' : 'Login' }}
          </button>
        </form>

        <div class="register-link" *ngIf="showRegister">
          <p>Belum punya akun? <a href="javascript:void(0)" (click)="showRegisterForm()">Daftar</a></p>
        </div>

        <div *ngIf="showRegister" class="register-form">
          <h3>Registrasi Admin Pertama</h3>
          <div class="form-group">
            <label>Nama</label>
            <input type="text" [(ngModel)]="registerData.nama" class="form-control" placeholder="Nama lengkap">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="registerData.email" class="form-control" placeholder="Email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="registerData.password" class="form-control" placeholder="Password">
          </div>
          <button class="btn btn-success w-100" (click)="onRegister()" [disabled]="loading">
            {{ loading ? 'Loading...' : 'Daftar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    h2 { margin: 0 0 0.5rem; color: #333; text-align: center; }
    .subtitle { color: #666; text-align: center; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: 500; color: #333; }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-control:focus { outline: none; border-color: #667eea; }
    .btn {
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-success { background: #28a745; color: white; margin-top: 0.5rem; }
    .w-100 { width: 100%; }
    .register-link { text-align: center; margin-top: 1rem; color: #666; }
    .register-link a { color: #667eea; text-decoration: none; }
    .register-form {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }
    .register-form h3 { font-size: 1rem; margin-bottom: 1rem; text-align: center; }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  showRegister = false;

  registerData = {
    nama: '',
    email: '',
    password: ''
  };

  constructor(private gadaiService: GadaiService, private router: Router) {
    this.checkShowRegister();
  }

  checkShowRegister() {
    this.gadaiService.getSummary().subscribe({
      error: () => this.showRegister = true
    });
  }

  onLogin() {
    this.loading = true;
    this.gadaiService.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminData', JSON.stringify(res.data.admin));
        Swal.fire('Berhasil', 'Login berhasil!', 'success');
        this.router.navigate(['/admin/gadai']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Gagal', err.error?.message || 'Login gagal', 'error');
      }
    });
  }

  showRegisterForm() {
    this.showRegister = true;
  }

  onRegister() {
    this.loading = true;
    this.gadaiService.register(
      this.registerData.nama,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (res) => {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminData', JSON.stringify(res.data.admin));
        Swal.fire('Berhasil', 'Registrasi berhasil!', 'success');
        this.router.navigate(['/admin/gadai']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Gagal', err.error?.message || 'Registrasi gagal', 'error');
      }
    });
  }
}
