import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { GadaiService } from '../../../services/gadai.service';
import { KATEGORI_BARANG } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header"><h3>Gadai Service</h3></div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/gadai" class="nav-item"><span class="icon">📋</span> Daftar Gadai</a>
          <a routerLink="/admin/gadai/create" class="nav-item"><span class="icon">➕</span> Tambah Gadai</a>
        </nav>
        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="page-header">
          <h1>Edit Gadai #{{ gadaiId }}</h1>
          <a [routerLink]="['/admin/gadai', gadaiId]" class="btn btn-secondary">← Kembali</a>
        </header>

        <form (ngSubmit)="onSubmit()" class="form-container" *ngIf="form">
          <div class="form-section">
            <h3>Data Customer</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Customer *</label>
                <input type="text" [(ngModel)]="form.customer.nama" name="customerName" class="form-control" required>
              </div>
              <div class="form-group">
                <label>No. HP *</label>
                <input type="text" [(ngModel)]="form.customer.noHp" name="noHp" class="form-control" required>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Data Barang</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Kategori Barang *</label>
                <select [(ngModel)]="form.kategoriBarang" name="kategoriBarang" class="form-control" required>
                  <option *ngFor="let k of kategoriList" [value]="k.value">{{ k.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nama Barang *</label>
                <input type="text" [(ngModel)]="form.namaBarang" name="namaBarang" class="form-control" required>
              </div>
              <div class="form-group full-width">
                <label>Atribut/Kelengkapan *</label>
                <input type="text" [(ngModel)]="form.atributTinggal" name="atributTinggal" class="form-control" required>
              </div>
              <div class="form-group full-width">
                <label>Deskripsi</label>
                <textarea [(ngModel)]="form.deskripsi" name="deskripsi" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Data Pinjaman</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nominal Pinjaman (Rp) *</label>
                <input type="number" [(ngModel)]="form.nominalPinjam" name="nominalPinjam"
                  class="form-control" (input)="calculateFee()" required>
              </div>
              <div class="form-group">
                <label>Bunga (%)</label>
                <input type="number" [(ngModel)]="form.bungaPersentase" name="bungaPersentase"
                  class="form-control" (input)="calculateFee()">
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
          </div>

          <div class="form-section">
            <h3>Foto</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Foto Barang</label>
                <input type="file" (change)="onFileChange($event, 'fotoBarang')" accept="image/*" class="form-control">
                <img *ngIf="form.fotoBarang && !form.fotoBarang.startsWith('data:')" [src]="'http://localhost:3000' + form.fotoBarang" class="preview-img">
                <img *ngIf="form.fotoBarang && form.fotoBarang.startsWith('data:')" [src]="form.fotoBarang" class="preview-img">
              </div>
              <div class="form-group">
                <label>Foto Pendukung</label>
                <input type="file" (change)="onFileChange($event, 'fotoPendukung')" accept="image/*" class="form-control">
                <img *ngIf="form.fotoPendukung && form.fotoPendukung.startsWith('data:')" [src]="form.fotoPendukung" class="preview-img">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" [routerLink]="['/admin/gadai', gadaiId]">Batal</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
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
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
    .btn { padding: 0.6rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-decoration: none; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class AdminEditComponent implements OnInit {
  form: any = null;
  gadaiId: number = 0;
  loading = false;
  kategoriList = KATEGORI_BARANG;

  constructor(
    private gadaiService: GadaiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.gadaiId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGadai();
  }

  loadGadai() {
    this.gadaiService.getGadaiById(this.gadaiId).subscribe({
      next: (res) => {
        const g = res.data;
        this.form = {
          customer: g.customer,
          kategoriBarang: g.kategoriBarang,
          namaBarang: g.namaBarang,
          nominalPinjam: Number(g.nominalPinjam),
          bungaPersentase: Number(g.bungaPersentase),
          fee: Number(g.fee),
          tanggalPinjam: g.tanggalPinjam.split('T')[0],
          tanggalKembali: g.tanggalKembali.split('T')[0],
          atributTinggal: g.atributTinggal,
          deskripsi: g.deskripsi,
          fotoBarang: g.fotoBarang || '',
          fotoPendukung: g.fotoPendukung || ''
        };
      },
      error: () => {
        Swal.fire('Error', 'Gadai tidak ditemukan', 'error');
        this.router.navigate(['/admin/gadai']);
      }
    });
  }

  calculateFee() {
    if (this.form.nominalPinjam && this.form.bungaPersentase) {
      this.form.fee = (this.form.nominalPinjam * this.form.bungaPersentase) / 100;
    }
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.form[field] = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.loading = true;
    const payload = {
      kategoriBarang: this.form.kategoriBarang,
      namaBarang: this.form.namaBarang,
      nominalPinjam: this.form.nominalPinjam,
      bungaPersentase: this.form.bungaPersentase,
      fee: this.form.fee,
      tanggalPinjam: this.form.tanggalPinjam,
      tanggalKembali: this.form.tanggalKembali,
      atributTinggal: this.form.atributTinggal,
      deskripsi: this.form.deskripsi,
      fotoBarang: this.form.fotoBarang,
      fotoPendukung: this.form.fotoPendukung
    };

    this.gadaiService.updateGadai(this.gadaiId, payload).subscribe({
      next: () => {
        Swal.fire('Berhasil', 'Gadai berhasil diperbarui', 'success');
        this.router.navigate(['/admin/gadai', this.gadaiId]);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Gagal', err.error?.message || 'Gagal menyimpan', 'error');
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    this.router.navigate(['/admin/login']);
  }
}
