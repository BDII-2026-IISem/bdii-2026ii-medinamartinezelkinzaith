export interface TrainerI {
  id?: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  specialty?: string | null;
  status: string;
}

export interface TrainerResponseI extends TrainerI {
  createdAt?: string;
  updatedAt?: string;
}
