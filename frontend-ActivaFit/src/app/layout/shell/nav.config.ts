export interface NavEntry {
  label: string;
  icon: string;
  routerLink: string;
  /** Clave que exige la ruta; sin ella, la entrada es siempre visible. */
  permission?: string;
}

export interface NavGroupConfig {
  label: string;
  items: NavEntry[];
}

export const NAV: NavGroupConfig[] = [
  {
    label: 'Operación',
    items: [
      { label: 'Panel', icon: 'pi pi-home', routerLink: '/dashboard', permission: 'GET /api/memberships' },
      { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clientes', permission: 'GET /api/clients' },
      { label: 'Entrenadores', icon: 'pi pi-id-card', routerLink: '/entrenadores', permission: 'GET /api/trainers' },
      { label: 'Planes', icon: 'pi pi-tags', routerLink: '/planes', permission: 'GET /api/plans' },
      { label: 'Ejercicios', icon: 'pi pi-bolt', routerLink: '/ejercicios', permission: 'GET /api/exercises' },
      { label: 'Rutinas', icon: 'pi pi-list', routerLink: '/rutinas', permission: 'GET /api/routines' },
      { label: 'Ejercicios de rutina', icon: 'pi pi-sliders-h', routerLink: '/ejercicios-rutina', permission: 'GET /api/routine-exercises' },
      { label: 'Medidas', icon: 'pi pi-chart-line', routerLink: '/medidas', permission: 'GET /api/measurements' },
      { label: 'Membresías', icon: 'pi pi-credit-card', routerLink: '/membresias', permission: 'GET /api/memberships' },
      { label: 'Pagos', icon: 'pi pi-wallet', routerLink: '/pagos', permission: 'GET /api/memberships' },
      { label: 'Asistencias', icon: 'pi pi-calendar', routerLink: '/asistencias', permission: 'GET /api/attendances' },
      
    ],
  },
  {
    label: 'Seguridad',
    items: [
      { label: 'Usuarios', icon: 'pi pi-user', routerLink: '/admin/usuarios', permission: 'GET /api/users' },
      { label: 'Roles', icon: 'pi pi-id-card', routerLink: '/admin/roles', permission: 'GET /api/roles' },
      { label: 'Recursos', icon: 'pi pi-server', routerLink: '/admin/recursos', permission: 'GET /api/resources' },
      { label: 'Asignaciones', icon: 'pi pi-link', routerLink: '/admin/asignaciones', permission: 'GET /api/role-users' },
      { label: 'Concesiones', icon: 'pi pi-key', routerLink: '/admin/permisos', permission: 'GET /api/resource-roles' },
    ],
  },
];

/** Filtra el catálogo con el predicado de la sesión; sin Angular, para poder probarlo. */
export function visibleNav(can: (permission: string) => boolean): NavGroupConfig[] {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0);
}