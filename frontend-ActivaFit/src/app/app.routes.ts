import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Login } from './components/auth/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  {
    path: 'clients',
    canActivate: [authGuard],
    loadChildren: () => import('./components/client/client.routes').then(m => m.CLIENT_ROUTES),
  },
  {
    path: 'trainers',
    canActivate: [authGuard],
    loadChildren: () => import('./components/trainer/trainer.routes').then(m => m.TRAINER_ROUTES),
  },
  {
    path: 'plans',
    canActivate: [authGuard],
    loadChildren: () => import('./components/plan/plan.routes').then(m => m.PLAN_ROUTES),
  },
  {
    path: 'routines',
    canActivate: [authGuard],
    loadChildren: () => import('./components/routine/routine.routes').then(m => m.ROUTINE_ROUTES),
  },
  {
    path: 'measurements',
    canActivate: [authGuard],
    loadChildren: () => import('./components/measurement/measurement.routes').then(m => m.MEASUREMENT_ROUTES),
  },
  {
    path: 'memberships',
    canActivate: [authGuard],
    loadChildren: () => import('./components/membership/membership.routes').then(m => m.MEMBERSHIP_ROUTES),
  },
];
