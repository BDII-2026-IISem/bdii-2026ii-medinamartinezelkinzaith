export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASSPORT';

export interface ClientI {
  id?: number;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  phone?: string | null;
  email: string;
  status: string;
}

export interface ClientResponseI extends ClientI {
  createdAt?: string;
  updatedAt?: string;
}
