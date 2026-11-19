
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
  // GENERAL
  {
    label: 'General',
    items: [
      {
        label: 'Panel',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
        permission: 'GET /api/memberships',
      },
    ],
  },

  // GESTIÓN
  {
    label: 'Gestión',
    items: [
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        routerLink: '/clientes',
        permission: 'GET /api/clients',
      },
      {
        label: 'Entrenadores',
        icon: 'pi pi-id-card',
        routerLink: '/entrenadores',
        permission: 'GET /api/trainers',
      },
      {
        label: 'Planes',
        icon: 'pi pi-tags',
        routerLink: '/planes',
        permission: 'GET /api/plans',
      },
      {
        label: 'Membresías',
        icon: 'pi pi-credit-card',
        routerLink: '/membresias',
        permission: 'GET /api/memberships',
      },
    ],
  },

  // ENTRENAMIENTO
  {
    label: 'Entrenamiento',
    items: [
      {
        label: 'Ejercicios',
        icon: 'pi pi-bolt',
        routerLink: '/ejercicios',
        permission: 'GET /api/exercises',
      },
      {
        label: 'Rutinas',
        icon: 'pi pi-list',
        routerLink: '/rutinas',
        permission: 'GET /api/routines',
      },
      {
        label: 'Ejercicios de rutina',
        icon: 'pi pi-sliders-h',
        routerLink: '/ejercicios-rutina',
        permission: 'GET /api/routine-exercises',
      },
      {
        label: 'Medidas',
        icon: 'pi pi-chart-line',
        routerLink: '/medidas',
        permission: 'GET /api/measurements',
      },
    ],
  },

  // CONTROL
  {
    label: 'Control',
    items: [
      {
        label: 'Pagos',
        icon: 'pi pi-wallet',
        routerLink: '/pagos',
        permission: 'GET /api/memberships',
      },
      {
        label: 'Asistencias',
        icon: 'pi pi-calendar',
        routerLink: '/asistencias',
        permission: 'GET /api/attendances',
      },
    ],
  },

  // SEGURIDAD
 
{
  label: 'Seguridad',
  items: [
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      routerLink: '/admin/usuarios',
      permission: 'GET /api/users',
    },
    {
      label: 'Roles y permisos',
      icon: 'pi pi-shield',
      routerLink: '/admin/rbac',
      permission: 'GET /api/resource-roles',
    },
    {
      label: 'Asignación de roles',
      icon: 'pi pi-user-plus',
      routerLink: '/admin/asignaciones',
      permission: 'GET /api/role-users',
    },
  ],
}

];

/** Filtra el catálogo según los permisos de la sesión. */
export function visibleNav(
  can: (permission: string) => boolean,
): NavGroupConfig[] {
  return NAV
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || can(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
