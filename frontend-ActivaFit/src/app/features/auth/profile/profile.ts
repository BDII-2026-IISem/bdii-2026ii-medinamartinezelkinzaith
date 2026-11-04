import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SessionStore } from '../../../core/services/session-store';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  host: { class: 'block' },
  selector: 'app-profile',
  imports: [ButtonModule, CardModule, PageHeader, TagModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);

  readonly refreshing = signal(false);

  /** Vuelve a pedir /auth/profile/ y /auth/permissions/ sin cerrar sesión. */
  refresh(): void {
    this.refreshing.set(true);
    this.auth.me().subscribe({
      next: () => {
        this.refreshing.set(false);
        this.notify.success('Sesión sincronizada');
      },
      error: () => this.refreshing.set(false),
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