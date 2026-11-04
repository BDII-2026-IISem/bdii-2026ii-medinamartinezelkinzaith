import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { authOnlyGuard } from './core/guards/auth-only-guard';
import { guestGuard } from './core/guards/guest-guard';
import { permissionGuard } from './core/guards/permission-guard';

/** Una ruta de negocio: guard de permiso y la clave que exige. */
const guarded = (permission: string) => ({
  canActivate: [permissionGuard],
  data: { permission },
});

export const routes: Routes = [
  {
    path: 'construir',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · ActivaFit',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Panel · ActivaFit',
        ...guarded('GET /api/memberships'),
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'clientes',
        title: 'Clientes · ActivaFit',
        ...guarded('GET /api/clients'),
        loadComponent: () =>
          import('./features/clients/client-list/client-list').then((m) => m.ClientList),
      },
      {
        path: 'entrenadores',
        title: 'Entrenadores · ActivaFit',
        ...guarded('GET /api/trainers'),
        loadComponent: () =>
          import('./features/trainers/trainer-list/trainer-list').then((m) => m.TrainerList),
      },
      {
        path: 'planes',
        title: 'Planes · ActivaFit',
        ...guarded('GET /api/plans'),
        loadComponent: () => import('./features/plans/plan-list/plan-list').then((m) => m.PlanList),
      },
      {
        path: 'ejercicios',
        title: 'Ejercicios · ActivaFit',
        ...guarded('GET /api/exercises'),
        loadComponent: () =>
          import('./features/exercises/exercise-list/exercise-list').then((m) => m.ExerciseList),
      },
      {
        path: 'rutinas',
        title: 'Rutinas · ActivaFit',
        ...guarded('GET /api/routines'),
        loadComponent: () =>
          import('./features/routines/routine-list/routine-list').then((m) => m.RoutineList),
      },
      {
        path: 'ejercicios-rutina',
        title: 'Ejercicios de rutina · ActivaFit',
        ...guarded('GET /api/routine-exercises'),
        loadComponent: () =>
          import('./features/routine-exercises/routine-exercise-list/routine-exercise-list').then(
            (m) => m.RoutineExerciseList,
          ),
      },
      {
        path: 'medidas',
        title: 'Medidas · ActivaFit',
        ...guarded('GET /api/measurements'),
        loadComponent: () =>
          import('./features/measurements/measurement-list/measurement-list').then(
            (m) => m.MeasurementList,
          ),
      },
      {
        path: 'membresias',
        title: 'Membresías · ActivaFit',
        ...guarded('GET /api/memberships'),
        loadComponent: () =>
          import('./features/memberships/membership-list/membership-list').then(
            (m) => m.MembershipList,
          ),
      },
      {
        path: 'membresias/:id',
        title: 'Detalle de membresía · ActivaFit',
        ...guarded('GET /api/memberships/:id'),
        loadComponent: () =>
          import('./features/memberships/membership-detail/membership-detail').then(
            (m) => m.MembershipDetail,
          ),
      },
      {
        path: 'pagos',
        title: 'Pagos · ActivaFit',
        ...guarded('GET /api/memberships'),
        loadComponent: () =>
          import('./features/payments/payment-list/payment-list').then((m) => m.PaymentList),
      },
      {
        path: 'asistencias',
        title: 'Asistencias · ActivaFit',
        ...guarded('GET /api/attendances'),
        loadComponent: () =>
          import('./features/attendances/attendance-list/attendance-list').then(
            (m) => m.AttendanceList,
          ),
      },
      {
        path: 'perfil',
        title: 'Mi sesión · ActivaFit',
        canActivate: [authOnlyGuard],
        loadComponent: () => import('./features/auth/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'forbidden',
        title: 'Acceso denegado · ActivaFit',
        loadComponent: () =>
          import('./features/auth/forbidden/forbidden').then((m) => m.Forbidden),
      },
            {
        path: 'admin/usuarios',
        title: 'Usuarios · ActivaFit',
        ...guarded('GET /api/users'),
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'admin/roles',
        title: 'Roles · ActivaFit',
        ...guarded('GET /api/roles'),
        loadComponent: () =>
          import('./features/admin/roles/role-list/role-list').then((m) => m.RoleList),
      },
      {
        path: 'admin/recursos',
        title: 'Recursos · ActivaFit',
        ...guarded('GET /api/resources'),
        loadComponent: () =>
          import('./features/admin/resources/resource-list/resource-list').then(
            (m) => m.ResourceList,
          ),
      },
      {
        path: 'admin/asignaciones',
        title: 'Asignaciones · ActivaFit',
        ...guarded('GET /api/role-users'),
        loadComponent: () =>
          import('./features/admin/role-users/role-user-list/role-user-list').then(
            (m) => m.RoleUserList,
          ),
      },
      {
        path: 'admin/permisos',
        title: 'Concesiones · ActivaFit',
        ...guarded('GET /api/resource-roles'),
        loadComponent: () =>
          import('./features/admin/resource-roles/resource-role-list/resource-role-list').then(
            (m) => m.ResourceRoleList,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];