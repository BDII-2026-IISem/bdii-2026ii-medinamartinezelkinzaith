const pad = (n: number): string => String(n).padStart(2, '0');

/** Fecha local como `YYYY-MM-DD`, sin pasar por UTC (que podría correr el día). */
export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Fecha y hora con la zona del navegador: `YYYY-MM-DDTHH:mm:ss±HH:mm`, nunca con `Z`. */
export function toIsoWithOffset(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absolute = Math.abs(offset);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${toDateOnly(date)}T${time}${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}