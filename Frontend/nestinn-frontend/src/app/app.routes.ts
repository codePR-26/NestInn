import { Routes } from '@angular/router';
import { authGuard, ownerGuard, ceoGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'auth/verify-otp', loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent) },
  { path: 'properties', loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent) },
  { path: 'properties/:id', loadComponent: () => import('./features/properties/property-detail/property-detail.component').then(m => m.PropertyDetailComponent) },
  { path: 'booking/new', loadComponent: () => import('./features/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent), canActivate: [authGuard] },
  { path: 'bookings', loadComponent: () => import('./features/booking/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent), canActivate: [authGuard] },
  { path: 'owner/dashboard', loadComponent: () => import('./features/owner/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent), canActivate: [ownerGuard] },
  { path: 'owner/properties', loadComponent: () => import('./features/owner/owner-properties/owner-properties.component').then(m => m.OwnerPropertiesComponent), canActivate: [ownerGuard] },
  { path: 'owner/add-property', loadComponent: () => import('./features/owner/add-property/add-property.component').then(m => m.AddPropertyComponent), canActivate: [ownerGuard] },
  { 
  path: 'owner/edit-property/:id', 
  loadComponent: () => import('./features/owner/add-property/add-property.component')
    .then(m => m.AddPropertyComponent), 
  canActivate: [ownerGuard] 
},
  { path: 'ceo/dashboard', loadComponent: () => import('./features/ceo/ceo-dashboard/ceo-dashboard.component').then(m => m.CeoDashboardComponent), canActivate: [ceoGuard] },
  { path: 'chat/:bookingId', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
