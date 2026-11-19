import { HttpMethod } from '../../../core/models/api.model';
import { Resource } from '../../../core/models/resource.model';

export type Action = 'C' | 'R' | 'U' | 'D';
export const ACTIONS: Action[] = ['C', 'R', 'U', 'D'];

/** Qué verbos HTTP concede cada casilla. */
const METHODS: Record<Action, HttpMethod[]> = {
  C: ['POST'],
  R: ['GET'],
  U: ['PUT', 'PATCH'],
  D: ['DELETE'],
};

export interface EntityRow {
  key: string;
  label: string;
  icon: string;
  /** Prefijo de la ruta tal como la guarda Django, con barra final. */
  base: string;
}

export const ENTITIES: EntityRow[] = [
  { key: 'clients', label: 'Clientes', icon: 'pi pi-users', base: 'api/clients/' },
  { key: 'trainers', label: 'Entrenadores', icon: 'pi pi-id-card', base: 'api/trainers/' },
  { key: 'plans', label: 'Planes', icon: 'pi pi-tags', base: 'api/plans/' },
  { key: 'exercises', label: 'Ejercicios', icon: 'pi pi-bolt', base: 'api/exercises/' },
  { key: 'routines', label: 'Rutinas', icon: 'pi pi-list', base: 'api/routines/' },
  { key: 'routine-exercises', label: 'Ejercicios de rutina', icon: 'pi pi-sliders-h', base: 'api/routine-exercises/' },
  { key: 'measurements', label: 'Medidas', icon: 'pi pi-chart-line', base: 'api/measurements/' },
  { key: 'attendances', label: 'Asistencias', icon: 'pi pi-calendar', base: 'api/attendances/' },
  { key: 'memberships', label: 'Membresías', icon: 'pi pi-credit-card', base: 'api/memberships/' },
];

export type CellMap = Record<string, Record<Action, Resource[]>>;
export type CellState = 'unavailable' | 'unchecked' | 'partial' | 'checked';

/** Recursos activos de una celda: misma entidad y los verbos de la acción. */
export function cellResources(resources: Resource[], entity: EntityRow, action: Action): Resource[] {
  return resources.filter(
    (r) => r.status === 'active' && r.route.startsWith(entity.base) && METHODS[action].includes(r.method),
  );
}

export function buildCells(resources: Resource[]): CellMap {
  const cells: CellMap = {};
  for (const entity of ENTITIES) {
    cells[entity.key] = {
      C: cellResources(resources, entity, 'C'),
      R: cellResources(resources, entity, 'R'),
      U: cellResources(resources, entity, 'U'),
      D: cellResources(resources, entity, 'D'),
    };
  }
  return cells;
}

/** Todos los recursos que la matriz controla; el resto no se toca. */
export function controlledIds(cells: CellMap): Set<number> {
  const ids = new Set<number>();
  for (const entity of ENTITIES) {
    for (const action of ACTIONS) {
      for (const resource of cells[entity.key][action]) {
        ids.add(resource.id);
      }
    }
  }
  return ids;
}

export function cellState(resources: Resource[], granted: ReadonlySet<number>): CellState {
  if (resources.length === 0) return 'unavailable';
  const count = resources.filter((r) => granted.has(r.id)).length;
  if (count === 0) return 'unchecked';
  return count === resources.length ? 'checked' : 'partial';
}

/** Si la celda está completa la apaga; si no, la completa. */
export function toggleCell(resources: Resource[], granted: ReadonlySet<number>): Set<number> {
  const next = new Set(granted);
  const complete = cellState(resources, granted) === 'checked';
  for (const resource of resources) {
    if (complete) next.delete(resource.id);
    else next.add(resource.id);
  }
  return next;
}

export interface GrantPlan {
  grant: number[];
  revoke: number[];
}

/** Solo lo que cambió, y solo sobre recursos controlados por la matriz. */
export function planChanges(
  current: ReadonlySet<number>,
  desired: ReadonlySet<number>,
  controlled: ReadonlySet<number>,
): GrantPlan {
  return {
    grant: [...desired].filter((id) => controlled.has(id) && !current.has(id)),
    revoke: [...current].filter((id) => controlled.has(id) && !desired.has(id)),
  };
}