import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SessionStore } from '../../core/services/session-store';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { visibleNav } from './nav.config';

/**
 * Cáscara de la aplicación: Header, Aside, contenido y Footer, montados una sola
 * vez. El menú y el menú de usuario se derivan de la sesión.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-shell',
  imports: [Aside, ConfirmDialogModule, DrawerModule, Footer, Header, RouterOutlet, ToastModule],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);

  /** `lg` de Tailwind: desde aquí el Aside es fijo y el botón lo alterna. */
  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);

  /** Menú filtrado por la matriz de permisos de la sesión. */
  readonly navGroups = computed<MenuItem[]>(() =>
    visibleNav((permission) => this.session.canPermission(permission)).map((group) => ({
      label: group.label,
      items: group.items.map<MenuItem>((item) => ({
        label: item.label,
        icon: item.icon,
        routerLink: item.routerLink,
      })),
    })),
  );

  readonly initials = computed(() =>
    (this.session.user()?.username ?? '').slice(0, 2).toUpperCase() || 'IN',
  );
  readonly roleLabel = computed(() => this.session.roles().join(', ') || 'Sin rol');

  readonly userItems = computed<MenuItem[]>(() => [
    { label: 'Mi sesión', icon: 'pi pi-user', routerLink: '/perfil' },
    { label: 'Actualizar permisos', icon: 'pi pi-refresh', command: () => this.refreshPermissions() },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
  ]);

  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }
    this.mobileOpen.set(true);
  }

  refreshPermissions(): void {
    this.auth.me().subscribe({
      next: () =>
        this.notify.success('Permisos actualizados', 'Menú y botones leen la matriz otra vez.'),
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.notify.info('Sesión cerrada');
        void this.router.navigate(['/login']);
      },
    });
  }
}