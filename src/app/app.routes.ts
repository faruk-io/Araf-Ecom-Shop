import { Routes } from '@angular/router';
import { staffGuard } from './core/services/staff.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    redirectTo: ''
  },
  {
    path: 'checkout',
    redirectTo: ''
  },
  {
    path: 'track',
    loadComponent: () => import('./features/track/track').then(m => m.TrackComponent)
  },
  {
    path: 'page/:key',
    loadComponent: () => import('./features/page/content-page').then(m => m.ContentPageComponent)
  },
  {
    path: 'staff/login',
    loadComponent: () => import('./features/staff/login/staff-login').then(m => m.StaffLoginComponent)
  },
  {
    path: 'staff/dashboard',
    canActivate: [staffGuard],
    loadComponent: () => import('./features/staff/dashboard/staff-dashboard').then(m => m.StaffDashboardComponent)
  },
  {
    path: 'staff/products',
    canActivate: [staffGuard],
    loadComponent: () => import('./features/staff/products/staff-products').then(m => m.StaffProductsComponent)
  },
  {
    path: 'staff/banners',
    canActivate: [staffGuard],
    loadComponent: () => import('./features/staff/banners/staff-banners').then(m => m.StaffBannersComponent)
  }
];
