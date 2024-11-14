export interface Curso {
  id?: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  profesor: string;
  horario: string;
  sala: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
} 