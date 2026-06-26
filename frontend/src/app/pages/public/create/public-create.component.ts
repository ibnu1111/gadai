import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GadaiService } from '../../../services/gadai.service';
import { KATEGORI_BARANG, JANGKA_WAKTU } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-public-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="public-layout">
      <!-- Header -->
      <header class="public-header">
        <div class="header-content">
          <h1>📿 Gadai Service</h1>
          <div class="header-nav">
            <a routerLink="/create" class="nav-link active">Pengajuan</a>
            <a routerLink="/track" class="nav-link">Lacak</a>
            <a routerLink="/admin/login" class="nav-link admin-link">Admin</a>
          </div>
        </div>
      </header>

      <main class="public-main">
        <div class="form-card">
          <div class="step-indicator">
            <div class="step" [class.active]="step >= 1" [class.completed]="step > 1">
              <span class="step-num">1</span>
              <span class="step-label">Data Diri</span>
            </div>
            <div class="step-line" [class.active]="step > 1"></div>
            <div class="step" [class.active]="step >= 2" [class.completed]="step > 2">
              <span class="step-num">2</span>
              <span class="step-label">Data Barang</span>
            </div>
            <div class="step-line" [class.active]="step > 2"></div>
            <div class="step" [class.active]="step >= 3">
              <span class="step-num">3</span>
              <span class="step-label">Pengajuan</span>
            </div>
          </div>

          <!-- Step 1: Data Diri -->
          <div *ngIf="step === 1" class="step-content">
            <h2>Data Diri</h2>
            <p class="step-desc">Lengkapi data diri Anda untuk pengajuan gadai</p>

            <div class="form-group">
              <label>Nama Lengkap *</label>
              <input type="text" [(ngModel)]="form.customerName" class="form-control"
                placeholder="Masukkan nama lengkap" minlength="3">
            </div>

            <div class="form-group">
              <label>Nomor HP (WhatsApp) *</label>
              <input type="tel" [(ngModel)]="form.phone" class="form-control"
                placeholder="08xxxxxxxxxx">
              <small class="hint">Contoh: 081234567890</small>
            </div>

            <div class="form-group">
              <label>Foto KTP *</label>
              <input type="file" (change)="onFileChange($event, 'fotoKtp')" accept="image/*" class="form-control">
              <small class="hint">Upload foto KTP yang jelas</small>
              <div *ngIf="form.fotoKtp" class="image-preview">
                <img [src]="form.fotoKtp" alt="Preview KTP">
              </div>
            </div>

            <button class="btn btn-primary w-100" (click)="nextStep()">Lanjut →</button>
          </div>

          <!-- Step 2: Data Barang -->
          <div *ngIf="step === 2" class="step-content">
            <h2>Data Barang</h2>
            <p class="step-desc">Informasi barang yang akan digadaikan</p>

            <div class="form-group">
              <label>Kategori Barang *</label>
              <select [(ngModel)]="form.kategoriBarang" class="form-control">
                <option value="">-- Pilih Kategori --</option>
                <option *ngFor="let k of kategoriList" [value]="k.value">{{ k.label }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Nama Barang *</label>
              <input type="text" [(ngModel)]="form.namaBarang" class="form-control"
                placeholder="Contoh: iPhone 13 Pro Max" minlength="3">
            </div>

            <div class="form-group">
              <label>Deskripsi *</label>
              <textarea [(ngModel)]="form.deskripsi" class="form-control" rows="3"
                placeholder="Jelaskan kondisi barang secara detail" minlength="10"></textarea>
            </div>

            <div class="form-group">
              <label>Foto Barang (Depan) *</label>
              <input type="file" (change)="onFileChange($event, 'fotoBarang')" accept="image/*" class="form-control">
              <div *ngIf="form.fotoBarang" class="image-preview">
                <img [src]="form.fotoBarang" alt="Preview Barang">
              </div>
            </div>

            <div class="form-group">
              <label>Foto Pendukung</label>
              <input type="file" (change)="onFileChange($event, 'fotoPendukung')" accept="image/*" class="form-control">
              <small class="hint">Tambahkan foto lain barang (sisi samping,IMEI, dll)</small>
              <div *ngIf="form.fotoPendukung" class="image-preview">
                <img [src]="form.fotoPendukung" alt="Preview Pendukung">
              </div>
            </div>

            <div class="btn-group">
              <button class="btn btn-secondary" (click)="prevStep()">← Kembali</button>
              <button class="btn btn-primary" (click)="nextStep()">Lanjut →</button>
            </div>
          </div>

          <!-- Step 3: Pengajuan -->
          <div *ngIf="step === 3" class="step-content">
            <h2>Pengajuan Pinjaman</h2>
            <p class="step-desc">Pilih nominal dan jangka waktu pinjaman</p>

            <div class="form-group">
              <label>Jangka Waktu *</label>
              <div class="jangka-waktu-options">
                <div class="jw-option" *ngFor="let jw of jangkaWaktuList"
                  [class.selected]="form.jangkaWaktu === jw.value"
                  (click)="selectJangkaWaktu(jw.value)">
                  <span class="jw-label">{{ jw.label }}</span>
                  <span class="jw-bunga">{{ jw.value === '2minggu' ? '10%' : '20%' }} bunga</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Nominal Pinjaman (Rp) *</label>
              <input type="number" [(ngModel)]="form.nominalPinjam" class="form-control"
                placeholder="Minimal Rp 100.000" min="100000" step="10000"
                (input)="calculateFee()">
              <small class="hint">Minimal Rp 100.000</small>
            </div>

            <div class="summary-box" *ngIf="form.nominalPinjam >= 100000">
              <div class="summary-row">
                <span>Nominal Pinjaman:</span>
                <strong>{{ formatRupiah(form.nominalPinjam) }}</strong>
              </div>
              <div class="summary-row">
                <span>Bunga ({{ bungaPersen }}%):</span>
                <strong>{{ formatRupiah(form.fee) }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total yang dikembalikan:</span>
                <strong class="text-primary">{{ formatRupiah(form.nominalPinjam + form.fee) }}</strong>
              </div>
              <div class="summary-row">
                <span>Tanggal Jatuh Tempo:</span>
                <strong>{{ tanggalKembaliLabel }}</strong>
              </div>
            </div>

            <div class="btn-group">
              <button class="btn btn-secondary" (click)="prevStep()">← Kembali</button>
              <button class="btn btn-success w-100" (click)="submit()" [disabled]="loading">
                {{ loading ? 'Mengirim...' : 'Ajukan Gadai' }}
              </button>
            </div>
          </div>

          <!-- Success State -->
          <div *ngIf="submitted" class="success-content">
            <div class="success-icon">✅</div>
            <h2>Pengajuan Berhasil!</h2>
            <p>Pengajuan gadai Anda telah diterima dan sedang dalam proses verifikasi.</p>

            <div class="result-card">
              <p><strong>ID Pengajuan:</strong> #{{ resultData?.gadaiId }}</p>
              <p><strong>Nominal:</strong> {{ formatRupiah(resultData?.nominalPengajuan || 0) }}</p>
              <p><strong>Bunga:</strong> {{ resultData?.bungaPersentase }}%</p>
              <p><strong>Fee:</strong> {{ formatRupiah(resultData?.fee || 0) }}</p>
              <p><strong>Jatuh Tempo:</strong> {{ formatDate(resultData?.tanggalKembali) }}</p>
            </div>

            <div class="wa-notification" *ngIf="waLink">
              <p>Notifikasi telah dikirim ke admin via WhatsApp</p>
              <a [href]="waLink" target="_blank" class="btn btn-whatsapp">
                💬 Hubungi Admin via WhatsApp
              </a>
            </div>

            <div class="action-buttons">
              <a routerLink="/create" class="btn btn-secondary">Pengajuan Baru</a>
              <a routerLink="/track" class="btn btn-primary">Lacak Status</a>
            </div>
          </div>
        </div>
      </main>

      <footer class="public-footer">
        <p>&copy; 2024 Gadai Service. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .public-layout { min-height: 100vh; display: flex; flex-direction: column; background: #f5f6fa; }
    .public-header { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
    .header-content { max-width: 600px; margin: 0 auto; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .public-header h1 { margin: 0; font-size: 1.25rem; color: #667eea; }
    .header-nav { display: flex; gap: 1rem; }
    .nav-link { color: #666; text-decoration: none; font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .nav-link:hover, .nav-link.active { color: #667eea; background: rgba(102,126,234,0.1); }
    .admin-link { color: #999; }
    .public-main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; }
    .form-card { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .step-indicator { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
    .step-num { width: 32px; height: 32px; border-radius: 50%; background: #ddd; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.875rem; }
    .step.active .step-num { background: #667eea; }
    .step.completed .step-num { background: #28a745; }
    .step-label { font-size: 0.75rem; color: #666; }
    .step.active .step-label { color: #667eea; font-weight: 500; }
    .step-line { width: 40px; height: 2px; background: #ddd; margin: 0 0.5rem; margin-bottom: 1.25rem; }
    .step-line.active { background: #667eea; }
    .step-content h2 { margin: 0 0 0.25rem; color: #333; font-size: 1.25rem; }
    .step-desc { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; font-weight: 500; margin-bottom: 0.25rem; color: #333; font-size: 0.875rem; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .hint { font-size: 0.75rem; color: #666; margin-top: 0.25rem; display: block; }
    .image-preview { margin-top: 0.5rem; }
    .image-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #ddd; }
    .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-decoration: none; display: inline-block; text-align: center; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-whatsapp { background: #25D366; color: white; width: 100%; margin-top: 1rem; }
    .w-100 { width: 100%; }
    .btn-group { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .jangka-waktu-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .jw-option { padding: 1rem; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.2s; }
    .jw-option:hover { border-color: #667eea; }
    .jw-option.selected { border-color: #667eea; background: rgba(102,126,234,0.1); }
    .jw-label { display: block; font-weight: 500; color: #333; }
    .jw-bunga { display: block; font-size: 0.75rem; color: #666; margin-top: 0.25rem; }
    .summary-box { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .summary-row.total { border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 1rem; }
    .text-primary { color: #667eea; }
    .success-content { text-align: center; }
    .success-icon { font-size: 4rem; margin-bottom: 1rem; }
    .success-content h2 { color: #28a745; margin-bottom: 0.5rem; }
    .result-card { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: left; }
    .result-card p { margin: 0.25rem 0; font-size: 0.875rem; }
    .wa-notification { margin: 1rem 0; padding: 1rem; background: #d4edda; border-radius: 8px; }
    .wa-notification p { margin: 0 0 0.5rem; font-size: 0.875rem; color: #155724; }
    .action-buttons { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .action-buttons .btn { flex: 1; }
    .public-footer { text-align: center; padding: 1rem; color: #999; font-size: 0.75rem; }
  `]
})
export class PublicCreateComponent {
  step = 1;
  loading = false;
  submitted = false;
  resultData: any = null;
  waLink = '';
  bungaPersen = 20;

  form = {
    customerName: '',
    phone: '',
    fotoKtp: '',
    kategoriBarang: '',
    namaBarang: '',
    deskripsi: '',
    fotoBarang: '',
    fotoPendukung: '',
    jangkaWaktu: '',
    nominalPinjam: 0,
    fee: 0
  };

  kategoriList = KATEGORI_BARANG;
  jangkaWaktuList = JANGKA_WAKTU;

  constructor(private gadaiService: GadaiService, private router: Router) {}

  selectJangkaWaktu(value: string) {
    this.form.jangkaWaktu = value;
    this.bungaPersen = value === '2minggu' ? 10 : 20;
    this.calculateFee();
  }

  calculateFee() {
    if (this.form.nominalPinjam) {
      this.form.fee = (this.form.nominalPinjam * this.bungaPersen) / 100;
    }
  }

  get tanggalKembaliLabel(): string {
    if (!this.form.jangkaWaktu) return '-';
    const today = new Date();
    if (this.form.jangkaWaktu === '2minggu') {
      today.setDate(today.getDate() + 14);
    } else {
      today.setMonth(today.getMonth() + 1);
    }
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  nextStep() {
    if (this.step === 1) {
      if (!this.form.customerName || this.form.customerName.length < 3) {
        Swal.fire('Peringatan', 'Nama minimal 3 karakter', 'warning');
        return;
      }
      if (!this.form.phone || !this.form.phone.match(/^[\d]{10,13}$/)) {
        Swal.fire('Peringatan', 'Nomor HP tidak valid', 'warning');
        return;
      }
    }
    if (this.step === 2) {
      if (!this.form.kategoriBarang || !this.form.namaBarang || this.form.namaBarang.length < 3) {
        Swal.fire('Peringatan', 'Lengkapi data barang', 'warning');
        return;
      }
      if (!this.form.deskripsi || this.form.deskripsi.length < 10) {
        Swal.fire('Peringatan', 'Deskripsi minimal 10 karakter', 'warning');
        return;
      }
      if (!this.form.fotoBarang) {
        Swal.fire('Peringatan', 'Upload foto barang wajib', 'warning');
        return;
      }
    }
    this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
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
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.form.jangkaWaktu) {
      Swal.fire('Peringatan', 'Pilih jangka waktu', 'warning');
      return;
    }
    if (!this.form.nominalPinjam || this.form.nominalPinjam < 100000) {
      Swal.fire('Peringatan', 'Minimal nominal Rp 100.000', 'warning');
      return;
    }

    this.loading = true;
    this.gadaiService.createPublicGadai(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.submitted = true;
        this.resultData = res.data;
        this.waLink = res.waNotificationLink || '';
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Gagal', err.error?.message || 'Pengajuan gagal', 'error');
      }
    });
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
