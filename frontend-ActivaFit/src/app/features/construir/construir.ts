import { Component, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../../layout/aside/aside';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

/**
 * Pantalla del prototipo.
 *
 * Es el único componente con estado: guarda el título elegido y el estado del
 * menú. El layout solo recibe datos por `input()`; así se puede reutilizar sin
 * duplicar Header, Aside ni Footer.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-construir',
  imports: [Aside, ButtonModule, CardModule, DrawerModule, Footer, Header],
  templateUrl: './construir.html',
  styleUrl: './construir.css',
})
export class Construir {
  /** `lg` de Tailwind: desde aquí el Aside es fijo y el botón lo alterna. */
  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');

  /** Escritorio: el Aside fijo se oculta y el contenido se ensancha. */
  readonly sidebarCollapsed = signal(false);

  /** Móvil: el Drawer se abre desde el botón y se cierra al elegir una opción. */
  readonly mobileOpen = signal(false);

  /** Título del contenido. Cambia al elegir una opción del menú, sin HTTP. */
  readonly title = signal('Inicio');

  /**
   * Menú en el formato `MenuItem` de PrimeNG.
   *
   * `command` ejecuta una función al elegir la opción. Todavía no navega: solo
   * cambia el título. Más adelante cada comando apuntará a una ruta real.
   */
  readonly items: MenuItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', command: () => this.seleccionar('Inicio') },
    { label: 'Clientes', icon: 'pi pi-users', command: () => this.seleccionar('Clientes') },
    {
      label: 'Entrenadores',
      icon: 'pi pi-id-card',
      command: () => this.seleccionar('Entrenadores'),
    },
    { label: 'Planes', icon: 'pi pi-tags', command: () => this.seleccionar('Planes') },
    { label: 'Ejercicios', icon: 'pi pi-bolt', command: () => this.seleccionar('Ejercicios') },
    { label: 'Rutinas', icon: 'pi pi-list', command: () => this.seleccionar('Rutinas') },
    {
      label: 'Medidas',
      icon: 'pi pi-chart-line',
      command: () => this.seleccionar('Medidas'),
    },
    {
      label: 'Membresías',
      icon: 'pi pi-credit-card',
      command: () => this.seleccionar('Membresías'),
    },
    {
      label: 'Asistencias',
      icon: 'pi pi-calendar',
      command: () => this.seleccionar('Asistencias'),
    },
  ];

  /**
   * Un solo botón, dos disposiciones: en escritorio alterna el Aside fijo; por
   * debajo de `lg` abre el Drawer (donde el Aside fijo no cabe).
   */
  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }
    this.mobileOpen.set(true);
  }

  /** Una sola puerta de entrada al estado: la usan todos los comandos. */
  protected seleccionar(titulo: string): void {
    this.title.set(titulo);
    this.mobileOpen.set(false);
  }
}