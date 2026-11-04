import { Component, computed, effect, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

interface Producto {
  nombre: string;
  precio: number;
  activo: boolean;
}

const INICIAL: Producto = { nombre: 'Plan mensual', precio: 80000, activo: true };

@Component({
  selector: 'app-ejemplo',
  imports: [ButtonModule, CardModule, TagModule],
  host: { class: 'block' },
  templateUrl: './ejemplo.html',
  styleUrl: './ejemplo.css',
})
export class Ejemplo {
  readonly producto = signal<Producto>({ ...INICIAL });
  readonly precioFinal = computed(() => Math.round(this.producto().precio * 1.19));
  readonly estadoTexto = computed(() => (this.producto().activo ? 'Activo' : 'Inactivo'));

  constructor() {
    effect(() => {
      const actual = this.producto();
      console.log(
        `[ejemplo] ${actual.nombre} · ${actual.precio} · ${actual.activo ? 'activo' : 'inactivo'}`,
      );
    });
  }

  variarPrecio(delta: number): void {
    this.producto.update((actual) => ({ ...actual, precio: actual.precio + delta }));
  }

  cambiarEstado(): void {
    this.producto.update((actual) => ({ ...actual, activo: !actual.activo }));
  }

  cambiarNombre(event: Event): void {
    const nombre = (event.target as HTMLInputElement).value;
    this.producto.update((actual) => ({ ...actual, nombre }));
  }

  reiniciar(): void {
    this.producto.set({ ...INICIAL });
  }
}