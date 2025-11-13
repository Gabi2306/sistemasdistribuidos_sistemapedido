export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  estado: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}