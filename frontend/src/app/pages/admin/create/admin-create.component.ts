import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GadaiService } from '../../../services/gadai.service';
import { KATEGORI_BARANG } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Gadai Service</h3>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/gadai" class="nav-item">
            <span class="icon">📋</span> Daftar Gadai
          </a>
          <a routerLink="/admin/gadai/create" class="nav-item active">
            <span class="icon">➕</span> Tambah Gadai
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="page-header">
          <h1>Tambah Gadai Baru</h1>
          <a routerLink="/admin/gadai" class="btn btn-secondary">← Kembali</a>
        </header>

        <form (ngSubmit)="onSubmit()" class="form-container">
          <!-- Customer Info -->
          <div class="form-section">
            <h3>Data Customer</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Customer *</label>
                <input type="text" [(ngModel)]="form.customerName" name="customerName" class="form-control" required>
              </div>
              <div class="form-group">
                <label>No. HP *</label>
                <input type="text" [(ngModel)]="form.noHp" name="noHp" class="form-control" placeholder="08xxxxxxxxx" required>
              </div>
              <div class="form-group">
                <label>Foto KTP</label>
                <input type="file" (change)="onFileChange($event, 'fotoKtp')" accept="image/*" class="form-control">
                <img *ngIf="form.fotoKtp" [src]="form.fotoKtp" class="preview-img">
              </div>
            </div>
          </div>

          <!-- Barang Info -->
          <div class="form-section">
            <h3>Data Barang</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Kategori Barang *</label>
                <select [(ngModel)]="form.kategoriBarang" name="kategoriBarang" class="form-control" required>
                  <option value="">-- Pilih Kategori --</option>
                  <option *ngFor="let k of kategoriList" [value]="k.value">{{ k.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nama Barang *</label>
                <input type="text" [(ngModel)]="form.namaBarang" name="namaBarang" class="form-control" required>
              </div>
              <div class="form-group full-width">
                <label>Atribut / Kelengkapan *</label>
                <input type="text" [(ngModel)]="form.atributTinggal" name="atributTinggal" class="form-control"
                  placeholder="Contoh: LCD retak, tombol kurang, dll" required>
              </div>
              <div class="form-group full-width">
                <label>Deskripsi</label>
                <textarea [(ngModel)]="form.deskripsi" name="deskripsi" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Foto Barang -->
          <div class="form-section">
            <h3>Foto Barang</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Foto Barang *</label>
                <input type="file" (change)="onFileChange($event, 'fotoBarang')" accept="image/*" class="form-control" required>
                <img *ngIf="form.fotoBarang" [src]="form.fotoBarang" class="preview-img">
              </div>
              <div class="form-group">
                <label>Foto Pendukung</label>
                <input type="file" (change)="onFileChange($event, 'fotoPendukung')" accept="image/*" class="form-control">
                <img *ngIf="form.fotoPendukung" [src]="form.fotoPendukung" class="preview-img">
              </div>
            </div>
          </div>

          <!-- Pinjaman Info -->
          <div class="form-section">
            <h3>Data Pinjaman</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nominal Pinjaman (Rp) *</label>
                <input type="number" [(ngModel)]="form.nominalPinjam" name="nominalPinjam"
                  class="form-control" (input)="calculateFee()" min="100000" required>
              </div>
              <div class="form-group">
                <label>Bunga (%)</label>
                <input type="number" [(ngModel)]="form.bungaPersentase" name="bungaPersentase"
                  class="form-control" (input)="calculateFee()" min="1" max="100">
              </div>
              <div class="form-group">
                <label>Fee (Rp)</label>
                <input type="text" [value]="form.fee | number" class="form-control" readonly>
              </div>
              <div class="form-group">
                <label>Tanggal Pinjam *</label>
                <input type="date" [(ngModel)]="form.tanggalPinjam" name="tanggalPinjam" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Tanggal Kembali *</label>
                <input type="date" [(ngModel)]="form.tanggalKembali" name="tanggalKembali" class="form-control" required>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-row">
                <span>Nominal Pinjaman:</span>
                <strong>{{ formatRupiah(form.nominalPinjam || 0) }}</strong>
              </div>
              <div class="summary-row">
                <span>Fee ({{ form.bungaPersentase }}%):</span>
                <strong>{{ formatRupiah(form.fee || 0) }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total Kembali:</span>
                <strong>{{ formatRupiah((form.nominalPinjam || 0) + (form.fee || 0)) }}</strong>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/admin/gadai">Batal</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan Gadai' }}
            </button>
          </div>
        </form>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 240px; background: #2c3e50; color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidebar-header h3 { margin: 0; }
    .sidebar-nav { flex: 1; padding: 1rem 0; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; color: rgba(255,255,255,0.7); text-decoration: none; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .btn-logout { width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 6px; cursor: pointer; }
    .main-content { flex: 1; background: #f5f6fa; padding: 1.5rem; overflow-y: auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #333; }
    .form-container { max-width: 800px; }
    .form-section { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .form-section h3 { margin: 0 0 1rem; color: #333; font-size: 1.1rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    label { font-weight: 500; margin-bottom: 0.25rem; color: #333; font-size: 0.875rem; }
    .form-control { padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .preview-img { max-width: 150px; max-height: 150px; margin-top: 0.5rem; border-radius: 6px; border: 1px solid #ddd; }
    .summary-box { background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-top: 1rem; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .summary-row.total { border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
    .btn { padding: 0.6rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class AdminCreateComponent implements OnInit {
  form = {
    customerName: '',
    noHp: '',
    fotoKtp: '',
    kategoriBarang: '',
    namaBarang: '',
    atributTinggal: '',
    deskripsi: '',
    fotoBarang: '',
    fotoPendukung: '',
    nominalPinjam: 0,
    bungaPersentase: 20,
    fee: 0,
    tanggalPinjam: '',
    tanggalKembali: ''
  };

  loading = false;
  kategoriList = KATEGORI_BARANG;

  constructor(
    private gadaiService: GadaiService,
    private router: Router
  ) {}

  ngOnInit() {
    const today = new Date();
    this.form.tanggalPinjam = today.toISOString().split('T')[0];
    const returnDate = new Date(today);
    returnDate.setMonth(returnDate.getMonth() + 1);
    this.form.tanggalKembali = returnDate.toISOString().split('T')[0];
  }

  calculateFee() {
    if (this.form.nominalPinjam && this.form.bungaPersentase) {
      this.form.fee = (this.form.nominalPinjam * this.form.bungaPersentase) / 100;
    }
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file, (base64: string) => {
        (this.form as any)[field] = base64;
      });
    }
  }

  compressImage(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.loading = true;
    const payload = {
      customerName: this.form.customerName,
      noHp: this.form.noHp,
      fotoKtp: this.form.fotoKtp,
      kategoriBarang: this.form.kategoriBarang,
      namaBarang: this.form.namaBarang,
      atributTinggal: this.form.atributTinggal,
      deskripsi: this.form.deskripsi,
      fotoBarang: this.form.fotoBarang,
      fotoPendukung: this.form.fotoPendukung,
      nominalPinjam: this.form.nominalPinjam,
      bungaPersentase: this.form.bungaPersentase,
      tanggalPinjam: this.form.tanggalPinjam,
      tanggalKembali: this.form.tanggalKembali,
      status: 'AKTIF'
    };

    this.gadaiService.createGadai(payload).subscribe({
      next: () => {
        Swal.fire('Berhasil', 'Gadai berhasil dibuat', 'success');
        this.router.navigate(['/admin/gadai']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Gagal', err.error?.message || 'Gagal menyimpan', 'error');
      }
    });
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    this.router.navigate(['/admin/login']);
  }
}
