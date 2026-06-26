import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { GadaiService } from '../../../services/gadai.service';
import { STATUS_LABELS, STATUS_COLORS } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-public-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="public-layout">
      <!-- Header -->
      <header class="public-header">
        <div class="header-content">
          <h1>📿 Gadai Service</h1>
          <div class="header-nav">
            <a routerLink="/create" class="nav-link">Pengajuan</a>
            <a routerLink="/track" class="nav-link active">Lacak</a>
            <a routerLink="/admin/login" class="nav-link admin-link">Admin</a>
          </div>
        </div>
      </header>

      <main class="public-main">
        <div class="form-card">
          <h2>Lacak Pengajuan</h2>
          <p class="subtitle">Masukkan nomor HP yang terdaftar</p>

          <div class="search-box">
            <input type="tel" [(ngModel)]="phone" class="form-control"
              placeholder="08xxxxxxxxxx" (keyup.enter)="track()">
            <button class="btn btn-primary" (click)="track()" [disabled]="loading">
              {{ loading ? '...' : '🔍 Lacak' }}
            </button>
          </div>

          <!-- Results -->
          <div *ngIf="customer" class="results">
            <div class="customer-header">
              <div class="customer-avatar">👤</div>
              <div>
                <h3>{{ customer.customerName }}</h3>
                <p>{{ customer.phone }}</p>
              </div>
            </div>

            <div *ngIf="pengajuan.length === 0" class="empty-state">
              <p>Tidak ada pengajuan gadai</p>
            </div>

            <div class="pengajuan-list" *ngIf="pengajuan.length > 0">
              <div class="pengajuan-card" *ngFor="let p of pengajuan"
                [class.status-overdue]="p.status === 'OVERDUE'"
                [class.status-lunas]="p.status === 'LUNAS'"
                [class.status-pending]="p.status === 'PENDING'">
                <div class="pengajuan-header">
                  <span class="pengajuan-id">#{{ p.gadaiId }}</span>
                  <span class="badge" [ngClass]="'badge-' + getStatusColor(p.status)">
                    {{ p.statusLabel }}
                  </span>
                </div>

                <div class="pengajuan-body">
                  <h4>{{ p.namaBarang }}</h4>
                  <p class="kategori">{{ p.kategoriBarang }}</p>

                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">Nominal</span>
                      <span class="value">{{ formatRupiah(p.nominalPinjam) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Bunga</span>
                      <span class="value">{{ p.bungaPersentase }}%</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Total</span>
                      <span class="value highlight">{{ formatRupiah(p.nominalPengambilan) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Sudah Bayar</span>
                      <span class="value">{{ formatRupiah(p.totalPembayaran) }}</span>
                    </div>
                  </div>

                  <div class="tanggal-info">
                    <p>📅 Pinjam: {{ formatDate(p.tanggalPengajuan) }}</p>
                    <p>⏰ Jatuh Tempo: {{ formatDate(p.tanggalKembali) }}</p>
                    <p *ngIf="p.perpanjanganKe > 0" class="extension">🔄 Perpanjangan ke-{{ p.perpanjanganKe }}</p>
                  </div>

                  <div class="progress-bar" *ngIf="p.status !== 'LUNAS' && p.status !== 'DITOLAK'">
                    <div class="progress-label">
                      <span>Progres Pembayaran</span>
                      <span>{{ getProgressPercent(p) }}%</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill" [style.width.%]="getProgressPercent(p)"></div>
                    </div>
                    <div class="progress-sisa">
                      Sisa: {{ formatRupiah(p.nominalPengambilan - p.totalPembayaran) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="searched && !customer" class="not-found">
            <p>Tidak ditemukan data untuk nomor ini</p>
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
    h2 { margin: 0 0 0.25rem; color: #333; text-align: center; }
    .subtitle { color: #666; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; }
    .search-box { display: flex; gap: 0.5rem; }
    .form-control { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.875rem; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 500; background: #667eea; color: white; }
    .btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .results { margin-top: 2rem; }
    .customer-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; margin-bottom: 1rem; }
    .customer-avatar { font-size: 2.5rem; }
    .customer-header h3 { margin: 0; color: #333; }
    .customer-header p { margin: 0; color: #666; font-size: 0.875rem; }
    .empty-state, .not-found { text-align: center; padding: 2rem; color: #666; }
    .pengajuan-list { display: flex; flex-direction: column; gap: 1rem; }
    .pengajuan-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
    .pengajuan-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #f8f9fa; }
    .pengajuan-id { font-weight: 600; color: #333; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .badge-info { background: #d1ecf1; color: #0c5460; }
    .badge-secondary { background: #e2e3e5; color: #383d41; }
    .badge-primary { background: #cfe2ff; color: #084298; }
    .pengajuan-body { padding: 1rem; }
    .pengajuan-body h4 { margin: 0 0 0.25rem; color: #333; }
    .kategori { margin: 0 0 1rem; color: #666; font-size: 0.75rem; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .detail-item { display: flex; flex-direction: column; }
    .detail-item .label { font-size: 0.75rem; color: #666; }
    .detail-item .value { font-weight: 500; color: #333; }
    .detail-item .value.highlight { color: #667eea; }
    .tanggal-info { margin-bottom: 1rem; }
    .tanggal-info p { margin: 0.25rem 0; font-size: 0.75rem; color: #666; }
    .tanggal-info .extension { color: #667eea; }
    .progress-bar { background: #f8f9fa; padding: 0.75rem; border-radius: 6px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.5rem; }
    .progress-track { height: 8px; background: #ddd; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #667eea; border-radius: 4px; transition: width 0.3s; }
    .progress-sisa { text-align: right; font-size: 0.75rem; color: #dc3545; margin-top: 0.25rem; }
    .public-footer { text-align: center; padding: 1rem; color: #999; font-size: 0.75rem; }
  `]
})
export class PublicTrackComponent {
  phone = '';
  loading = false;
  searched = false;
  customer: any = null;
  pengajuan: any[] = [];

  constructor(
    private gadaiService: GadaiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/track'], { queryParams: { id } });
    }
  }

  track() {
    if (!this.phone) {
      Swal.fire('Peringatan', 'Masukkan nomor HP', 'warning');
      return;
    }

    this.loading = true;
    this.searched = true;

    this.gadaiService.trackGadai(this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        this.customer = res.customer;
        this.pengajuan = res.pengajuan || [];
      },
      error: () => {
        this.loading = false;
        this.customer = null;
        this.pengajuan = [];
      }
    });
  }

  getProgressPercent(p: any): number {
    if (p.nominalPengambilan === 0) return 0;
    return Math.round((p.totalPembayaran / p.nominalPengambilan) * 100);
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || 'secondary';
  }
}
