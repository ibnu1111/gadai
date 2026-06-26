import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/public/create/public-create.component').then(m => m.PublicCreateComponent)
  },
  {
    path: 'track',
    loadComponent: () => import('./pages/public/track/public-track.component').then(m => m.PublicTrackComponent)
  },
  {
    path: 'track/:id',
    loadComponent: () => import('./pages/public/track/public-track.component').then(m => m.PublicTrackComponent)
  },

  // Admin routes
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'gadai',
        pathMatch: 'full'
      },
      {
        path: 'gadai',
        loadComponent: () => import('./pages/admin/landing/admin-landing.component').then(m => m.AdminLandingComponent)
      },
      {
        path: 'gadai/create',
        loadComponent: () => import('./pages/admin/create/admin-create.component').then(m => m.AdminCreateComponent)
      },
      {
        path: 'gadai/edit/:id',
        loadComponent: () => import('./pages/admin/edit/admin-edit.component').then(m => m.AdminEditComponent)
      },
      {
        path: 'gadai/:id',
        loadComponent: () => import('./pages/admin/detail/admin-detail.component').then(m => m.AdminDetailComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'create'
  }
];
