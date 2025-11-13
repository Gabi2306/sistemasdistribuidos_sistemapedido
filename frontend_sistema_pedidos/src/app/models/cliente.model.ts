export interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_registro?: string;
}

export interface ClienteCreate {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}