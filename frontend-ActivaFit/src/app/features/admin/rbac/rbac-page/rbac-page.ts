import { Component, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { ResourceList } from '../../resources/resource-list/resource-list';
import { UserList } from '../../users/user-list/user-list';
import { RolePermissions } from '../role-permissions/role-permissions';

@Component({
  host: { class: 'block' },
  selector: 'app-rbac-page',
  imports: [PageHeader, ResourceList, RolePermissions, TabsModule, UserList],
  templateUrl: './rbac-page.html',
  styleUrl: './rbac-page.css',
})
export class RbacPage {
  readonly tab = signal<string | number>('roles');
}