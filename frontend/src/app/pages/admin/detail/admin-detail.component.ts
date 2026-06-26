import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GadaiService } from '../../../services/gadai.service';
import { STATUS_LABELS, STATUS_COLORS } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
          <h1>Detail Gadai #{{ gadai?.gadaiID }}</h1>
          <div class="header-actions">
            <a [routerLink]="['/admin/gadai/edit', gadaiId]" class="btn btn-secondary">✏️ Edit</a>
            <button class="btn btn-danger" (click)="deleteGadai()">🗑️ Hapus</button>
          </div>
        </header>

        <div *ngIf="gadai" class="detail-container">
          <!-- Status -->
          <div class="status-banner" [ngClass]="'status-' + gadai.status">
            <span class="badge" [ngClass]="'badge-' + getStatusColor(gadai.status)">
              {{ getStatusLabel(gadai.status) }}
            </span>
            <span *ngIf="gadai.perpanjanganKe > 0" class="extension-info">
              Perpanjangan ke-{{ gadai.perpanjanganKe }}
            </span>
          </div>

          <!-- Info Cards -->
          <div class="info-grid">
            <div class="info-card">
              <h4>Data Customer</h4>
              <p><strong>{{ gadai.customer?.nama }}</strong></p>
              <p>{{ gadai.customer?.noHp }}</p>
            </div>
            <div class="info-card">
              <h4>Data Barang</h4>
              <p><strong>{{ gadai.namaBarang }}</strong></p>
              <p>{{ gadai.kategoriBarang }}</p>
              <p class="muted">{{ gadai.atributTinggal }}</p>
            </div>
            <div class="info-card">
              <h4>Data Pinjaman</h4>
              <p><strong>{{ formatRupiah(gadai.nominalPinjam) }}</strong></p>
              <p>Bunga {{ gadai.bungaPerscentage }}% | Fee {{ formatRupiah(gadai.fee) }}</p>
              <p>Total: <strong>{{ formatRupiah(gadai.nominalPinjam + gadai.fee) }}</strong></p>
            </div>
            <div class="info-card">
              <h4>Tanggal</h4>
              <p>Pinjam: {{ formatDate(gadai.tanggalPinjam) }}</p>
              <p>Kembali: {{ formatDate(gadai.tanggalKembali) }}</p>
            </div>
          </div>

          <!-- Fotos -->
          <div class="photos-section">
            <h3>Foto Barang</h3>
            <div class="photos-grid">
              <div class="photo-item" *ngIf="gadai.fotoBarang">
                <img [src]="gadai.fotoBarang" alt="Foto Barang">
                <span>Foto Utama</span>
              </div>
              <div class="photo-item" *ngIf="gadai.fotoPendukung">
                <img [src]="gadai.fotoPendukung" alt="Foto Pendukung">
                <span>Foto Pendukung</span>
              </div>
            </div>
          </div>

          <!-- Pembayaran -->
          <div class="payment-section">
            <h3>Pembayaran</h3>
            <div class="payment-summary">
              <div class="payment-row">
                <span>Total Kembali:</span>
                <strong>{{ formatRupiah(gadai.nominalPinjam + gadai.fee) }}</strong>
              </div>
              <div class="payment-row">
                <span>Sudah Bayar:</span>
                <strong class="text-success">{{ formatRupiah(gadai.totalPembayaran) }}</strong>
              </div>
              <div class="payment-row">
                <span>Sisa:</span>
                <strong class="text-danger">{{ formatRupiah((gadai.nominalPinjam + gadai.fee) - gadai.totalPembayaran) }}</strong>
              </div>
            </div>

            <div class="payment-actions" *ngIf="gadai.status !== 'LUNAS' && gadai.status !== 'DITOLAK'">
              <button class="btn btn-success" (click)="openPaymentModal()">💰 Bayar</button>
              <button class="btn btn-primary" (click)="openExtendModal()">🔄 Perpanjang</button>
            </div>
          </div>

          <!-- Riwayat Pembayaran -->
          <div class="history-section" *ngIf="payments.length > 0">
            <h3>Riwayat Pembayaran</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jumlah</th>
                  <th>Tipe</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of payments">
                  <td>{{ formatDateTime(p.createdAt) }}</td>
                  <td>{{ formatRupiah(p.jumlahBayar) }}</td>
                  <td>{{ p.tipeBayar }}</td>
                  <td>{{ p.catatan || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
    .header-actions { display: flex; gap: 0.5rem; }
    .detail-container { max-width: 900px; }
    .status-banner { background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
    .badge { display: inline-block; padding: 0.35rem 1rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .badge-info { background: #d1ecf1; color: #0c5460; }
    .badge-secondary { background: #e2e3e5; color: #383d41; }
    .badge-primary { background: #cfe2ff; color: #084298; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .info-card { background: white; padding: 1rem; border-radius: 8px; }
    .info-card h4 { margin: 0 0 0.5rem; color: #667eea; font-size: 0.875rem; }
    .info-card p { margin: 0.25rem 0; font-size: 0.875rem; }
    .info-card .muted { color: #666; }
    .photos-section, .payment-section, .history-section { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    .photos-section h3, .payment-section h3, .history-section h3 { margin: 0 0 1rem; color: #333; }
    .photos-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
    .photo-item { text-align: center; }
    .photo-item img { max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd; }
    .photo-item span { display: block; font-size: 0.75rem; color: #666; margin-top: 0.25rem; }
    .payment-summary { background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .payment-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .payment-row:last-child { margin-bottom: 0; }
    .payment-actions { display: flex; gap: 0.5rem; }
    .text-success { color: #28a745; }
    .text-danger { color: #dc3545; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #eee; font-size: 0.875rem; }
    .data-table td { padding: 0.75rem; border-bottom: 1px solid #eee; font-size: 0.875rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .btn-secondary { background: #6c757d; color: white; text-decoration: none; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-primary { background: #667eea; color: white; }
  `]
})
export class AdminDetailComponent implements OnInit {
  gadai: any = null;
  gadaiId: number = 0;
  payments: any[] = [];

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
        this.gadai = res.data;
        this.payments = res.data.payments || [];
      },
      error: () => {
        Swal.fire('Error', 'Gadai tidak ditemukan', 'error');
        this.router.navigate(['/admin/gadai']);
      }
    });
  }

  openPaymentModal() {
    const sisa = (Number(this.gadai.nominalPinjam) + Number(this.gadai.fee)) - Number(this.gadai.totalPembayaran);

    Swal.fire({
      title: 'Bayar Gadai',
      html: `
        <p>Total Kembali: <strong>${this.formatRupiah(Number(this.gadai.nominalPinjam) + Number(this.gadai.fee))}</strong></p>
        <p>Sudah Bayar: <strong>${this.formatRupiah(Number(this.gadai.totalPembayaran))}</strong></p>
        <p>Sisa: <strong>${this.formatRupiah(sisa)}</strong></p>
        <input type="number" id="jumlahBayar" class="swal2-input" placeholder="Jumlah Bayar" max="${sisa}">
        <input type="text" id="catatan" class="swal2-input" placeholder="Catatan (opsional)">
      `,
      showCancelButton: true,
      preConfirm: () => {
        const jumlahBayar = (document.getElementById('jumlahBayar') as HTMLInputElement).value;
        const catatan = (document.getElementById('catatan') as HTMLInputElement).value;
        if (!jumlahBayar) {
          Swal.showValidationMessage('Jumlah bayar harus diisi');
          return false;
        }
        return { jumlahBayar: parseFloat(jumlahBayar), catatan };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.gadaiService.processPayment(this.gadaiId, result.value!.jumlahBayar, result.value!.catatan).subscribe({
          next: () => {
            Swal.fire('Berhasil', 'Pembayaran berhasil', 'success');
            this.loadGadai();
          },
          error: (err) => Swal.fire('Gagal', err.error?.message || 'Pembayaran gagal', 'error')
        });
      }
    });
  }

  openExtendModal() {
    Swal.fire({
      title: 'Perpanjang Gadai',
      html: `
        <p>Fee saat ini: <strong>${this.formatRupiah(Number(this.gadai.fee))}</strong></p>
        <select id="periode" class="swal2-select">
          <option value="2_WEEKS">2 Minggu</option>
          <option value="1_MONTH">1 Bulan</option>
        </select>
        <input type="number" id="feeBayar" class="swal2-input" placeholder="Fee yang dibayar" value="${this.gadai.fee}">
      `,
      showCancelButton: true,
      preConfirm: () => {
        const periode = (document.getElementById('periode') as HTMLSelectElement).value;
        const feeBayar = parseFloat((document.getElementById('feeBayar') as HTMLInputElement).value);
        if (!feeBayar) {
          Swal.showValidationMessage('Fee harus diisi');
          return false;
        }
        return { periode, feeBayar };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.gadaiService.extendGadai(this.gadaiId, result.value!.periode, result.value!.feeBayar).subscribe({
          next: (res) => {
            Swal.fire('Berhasil', res.message, 'success');
            this.router.navigate(['/admin/gadai']);
          },
          error: (err) => Swal.fire('Gagal', err.error?.message || 'Perpanjangan gagal', 'error')
        });
      }
    });
  }

  deleteGadai() {
    Swal.fire({
      title: 'Hapus Gadai?',
      text: 'Yakin ingin menghapus gadai ini?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.gadaiService.deleteGadai(this.gadaiId).subscribe({
          next: () => {
            Swal.fire('Berhasil', 'Gadai dihapus', 'success');
            this.router.navigate(['/admin/gadai']);
          },
          error: (err) => Swal.fire('Gagal', err.error?.message || 'Gagal hapus', 'error')
        });
      }
    });
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || 'secondary';
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    this.router.navigate(['/admin/login']);
  }
}
