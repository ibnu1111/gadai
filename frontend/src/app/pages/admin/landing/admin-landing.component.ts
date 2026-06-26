import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GadaiService } from '../../../services/gadai.service';
import { Gadai, STATUS_LABELS, STATUS_COLORS, Summary } from '../../../models/gadai.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Gadai Service</h3>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/gadai" class="nav-item active">
            <span class="icon">📋</span> Daftar Gadai
          </a>
          <a routerLink="/admin/gadai/create" class="nav-item">
            <span class="icon">➕</span> Tambah Gadai
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="page-header">
          <h1>Daftar Gadai</h1>
          <a routerLink="/admin/gadai/create" class="btn btn-primary">
            ➕ Tambah Gadai
          </a>
        </header>

        <!-- Summary Cards -->
        <div class="summary-cards" *ngIf="summary">
          <div class="card">
            <div class="card-value">{{ summary.totalGadai }}</div>
            <div class="card-label">Total</div>
          </div>
          <div class="card card-success">
            <div class="card-value">{{ summary.aktif }}</div>
            <div class="card-label">Aktif</div>
          </div>
          <div class="card card-warning">
            <div class="card-value">{{ summary.pending }}</div>
            <div class="card-label">Pending</div>
          </div>
          <div class="card card-danger">
            <div class="card-value">{{ summary.overdue }}</div>
            <div class="card-label">Terlambat</div>
          </div>
          <div class="card card-info">
            <div class="card-value">{{ summary.lunas }}</div>
            <div class="card-label">Lunas</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Cari nama barang atau customer..."
            class="search-input">

          <select [(ngModel)]="filterStatus" (change)="loadGadai()" class="filter-select">
            <option value="">Semua Status</option>
            <option *ngFor="let status of statusList" [value]="status">
              {{ getStatusLabel(status) }}
            </option>
          </select>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Barang</th>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let g of gadais">
                <td>#{{ g.gadaiID }}</td>
                <td>
                  <div class="customer-info">
                    <strong>{{ g.customer?.nama }}</strong>
                    <small>{{ g.customer?.noHp }}</small>
                  </div>
                </td>
                <td>{{ g.namaBarang }}</td>
                <td>{{ g.kategoriBarang }}</td>
                <td>{{ formatRupiah(g.nominalPinjam) }}</td>
                <td>{{ formatDate(g.tanggalKembali) }}</td>
                <td>
                  <span class="badge" [ngClass]="'badge-' + getStatusColor(g.status)">
                    {{ getStatusLabel(g.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-info" (click)="viewDetail(g.gadaiID!)">
                      Detail
                    </button>
                    <button *ngIf="g.status === 'PENDING'" class="btn btn-sm btn-success" (click)="approve(g)">
                      Setuju
                    </button>
                    <button *ngIf="g.status === 'PENDING'" class="btn btn-sm btn-danger" (click)="reject(g)">
                      Tolak
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="gadais.length === 0">
                <td colspan="8" class="text-center">Tidak ada data gadai</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination.totalPages > 1">
          <button
            *ngFor="let page of pages"
            (click)="goToPage(page)"
            [class.active]="page === pagination.page"
            class="page-btn">
            {{ page }}
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px;
      background: #2c3e50;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidebar-header h3 { margin: 0; font-size: 1.25rem; }
    .sidebar-nav { flex: 1; padding: 1rem 0; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-item:hover, .nav-item.active {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .nav-item .icon { font-size: 1.25rem; }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .btn-logout {
      width: 100%;
      padding: 0.5rem;
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      border-radius: 6px;
      cursor: pointer;
    }
    .main-content { flex: 1; background: #f5f6fa; padding: 1.5rem; overflow-y: auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #333; }
    .summary-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .card {
      background: white;
      padding: 1.25rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      text-align: center;
    }
    .card-value { font-size: 2rem; font-weight: bold; color: #333; }
    .card-label { font-size: 0.875rem; color: #666; margin-top: 0.25rem; }
    .card-success .card-value, .card-success .card-label { color: #28a745; }
    .card-warning .card-value, .card-warning .card-label { color: #ffc107; }
    .card-danger .card-value, .card-danger .card-label { color: #dc3545; }
    .card-info .card-value, .card-info .card-label { color: #17a2b8; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    .filter-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.875rem;
      min-width: 150px;
    }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #eee;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #eee;
      font-size: 0.875rem;
    }
    .data-table tr:hover { background: #f8f9fa; }
    .customer-info { display: flex; flex-direction: column; }
    .customer-info strong { color: #333; }
    .customer-info small { color: #666; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .badge-info { background: #d1ecf1; color: #0c5460; }
    .badge-secondary { background: #e2e3e5; color: #383d41; }
    .badge-primary { background: #cfe2ff; color: #084298; }
    .action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-decoration: none; display: inline-block; }
    .btn-primary { background: #667eea; color: white; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.75rem; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .text-center { text-align: center; }
    .pagination { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
    .page-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    .page-btn.active { background: #667eea; color: white; border-color: #667eea; }
  `]
})
export class AdminLandingComponent implements OnInit {
  gadais: any[] = [];
  summary: Summary | null = null;
  searchTerm = '';
  filterStatus = '';
  loading = false;
  pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
  pages: number[] = [];
  statusList = ['PENDING', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG'];

  constructor(
    private gadaiService: GadaiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGadai();
    this.loadSummary();
  }

  loadGadai() {
    this.loading = true;
    this.gadaiService.getAllGadai({
      page: this.pagination.page,
      limit: this.pagination.limit,
      status: this.filterStatus || undefined,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (res) => {
        this.gadais = res.data;
        this.pagination = res.pagination;
        this.pages = Array.from({ length: this.pagination.totalPages }, (_, i) => i + 1);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadSummary() {
    this.gadaiService.getSummary().subscribe({
      next: (res) => this.summary = res.data
    });
  }

  onSearch() {
    this.pagination.page = 1;
    this.loadGadai();
  }

  goToPage(page: number) {
    this.pagination.page = page;
    this.loadGadai();
  }

  viewDetail(id: number) {
    this.router.navigate(['/admin/gadai', id]);
  }

  approve(gadai: any) {
    Swal.fire({
      title: 'Setujui Gadai?',
      text: `Yakin ingin menyetujui gadai #${gadai.gadaiID}?`,
      icon: 'question',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.gadaiService.updateGadaiStatus(gadai.gadaiID!, 'AKTIF').subscribe({
          next: () => {
            Swal.fire('Berhasil', 'Gadai berhasil disetujui', 'success');
            this.loadGadai();
            this.loadSummary();
          },
          error: (err) => Swal.fire('Gagal', err.error?.message || 'Gagal approve', 'error')
        });
      }
    });
  }

  reject(gadai: any) {
    Swal.fire({
      title: 'Tolak Gadai?',
      text: `Yakin ingin menolak gadai #${gadai.gadaiID}?`,
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.gadaiService.updateGadaiStatus(gadai.gadaiID!, 'DITOLAK').subscribe({
          next: () => {
            Swal.fire('Berhasil', 'Gadai ditolak', 'success');
            this.loadGadai();
            this.loadSummary();
          },
          error: (err) => Swal.fire('Gagal', err.error?.message || 'Gagal tolak', 'error')
        });
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    this.router.navigate(['/admin/login']);
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || 'secondary';
  }
}
