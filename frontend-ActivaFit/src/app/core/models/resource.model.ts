// resource.model.ts — /api/resources/. La tupla (method, route) es única.
import { HttpMethod, Status, Timestamps } from './api.model';

export interface Resource extends Timestamps {
  id: number;
  name: string;
  method: HttpMethod;
  route: string;
  status: Status;
}

export interface ResourcePayload {
  name: string;
  method: HttpMethod;
  route: string;
  status: Status;
}