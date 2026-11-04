// resource-role.model.ts — /api/resource-roles/. ESTA fila es el permiso.
import { Status, Timestamps } from './api.model';

export interface ResourceRole extends Timestamps {
  id: number;
  resourceId: number;
  resourceName?: string;
  roleId: number;
  roleName?: string;
  status: Status;
}

export interface ResourceRolePayload {
  roleId: number;
  resourceId: number;
  status: Status;
}