export interface PlanI {
  id?: number;
  name: string;
  description?: string | null;
  status: string;
}

export interface PlanResponseI extends PlanI {
  createdAt?: string;
  updatedAt?: string;
}
