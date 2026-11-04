import { HttpMethod } from '../models/api.model';

/** Opciones del `p-select` de `method`: el valor es el propio verbo. */
export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary';

const SEVERITY: Record<HttpMethod, Severity> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warn',
  PATCH: 'warn',
  DELETE: 'danger',
};

export const methodSeverity = (method?: HttpMethod): Severity =>
  method ? SEVERITY[method] : 'secondary';