// role-user.model.ts — /api/role-users/. `userId` + `roleId` es único.
import { Status, Timestamps } from './api.model';

export interface RoleUser extends Timestamps {
  id: number;
  userId: number;
  username?: string;
  roleId: number;
  roleName?: string;
  status: Status;
}

export interface RoleUserPayload {
  userId: number;
  roleId: number;
  status: Status;
}