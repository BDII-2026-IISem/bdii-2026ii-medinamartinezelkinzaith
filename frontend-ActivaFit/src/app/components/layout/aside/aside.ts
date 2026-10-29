import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenu } from 'primeng/panelmenu';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [PanelMenu],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside {
  items: MenuItem[] = [
    { label: 'Clientes', icon: 'pi pi-fw pi-users', routerLink: '/clients' },
    { label: 'Entrenadores', icon: 'pi pi-fw pi-id-card', routerLink: '/trainers' },
    { label: 'Planes', icon: 'pi pi-fw pi-tags', routerLink: '/plans' },
    { label: 'Rutinas', icon: 'pi pi-fw pi-list', routerLink: '/routines' },
    { label: 'Medidas', icon: 'pi pi-fw pi-chart-line', routerLink: '/measurements' },
    { label: 'Membresías', icon: 'pi pi-fw pi-credit-card', routerLink: '/memberships' },
    { label: 'Administración', icon: 'pi pi-fw pi-user', routerLink: '/login' }
  ];
}