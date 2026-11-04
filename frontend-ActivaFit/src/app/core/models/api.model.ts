/** Estado único del contrato: la baja es lógica, nunca borra la fila. */
export type Status = 'active' | 'inactive';

/** Importe tal como viaja: string decimal ("50000.00"). Nunca se opera con float. */
export type Money = string;

/** Métodos de `resources.method` (fase de seguridad). */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Fechas del contrato: ISO-8601 con zona. */
export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}

/** Cuerpo de error: `{ "detail": "..." }` o `{ "campo": ["mensaje"] }`. */
export interface ApiError {
  detail?: string;
}

/** Importe del contrato a número, para sumar o comparar en el dashboard. */
export function toNumber(value: Money | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
/** `optionLabel="label"` y `optionValue="value"` en los `p-select` de estado. */
export const STATUS_OPTIONS: Array<{ label: string; value: Status }> = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
];