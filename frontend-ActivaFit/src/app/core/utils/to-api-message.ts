import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api.model';

/** Texto de respaldo cuando el cuerpo no trae nada útil. */
const POR_CODIGO: Record<number, string> = {
  400: 'Revisa los datos del formulario.',
  401: 'La sesión no es válida. Vuelve a iniciar sesión.',
  403: 'No tienes autorización para esta operación.',
  404: 'El registro ya no existe.',
  409: 'Ese dato ya está registrado.',
};

/** Traduce el error HTTP del contrato a un mensaje legible. */
export function toApiMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : 'Error inesperado';
  }
  if (error.status === 0) {
    return 'No se pudo conectar con la API. Verifica que el backend de Django esté en ejecución.';
  }

  const body: unknown = error.error;
  const detail = body && typeof body === 'object' ? (body as ApiError).detail : null;
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  // 400 de serializer: `{ "campo": ["mensaje"] }` → "campo: mensaje".
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const [campo, valor] of Object.entries(body as Record<string, unknown>)) {
      const mensaje = Array.isArray(valor) ? valor[0] : valor;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return `${campo}: ${mensaje.trim()}`;
      }
    }
  }

  return POR_CODIGO[error.status] ?? error.message;
}