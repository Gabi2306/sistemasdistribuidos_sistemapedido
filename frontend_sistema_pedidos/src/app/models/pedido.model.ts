export interface Pedido {
  id_pedido: number;
  id_cliente: number;
  fecha_pedido: string;
  estado: 'pendiente' | 'en_proceso' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  direccion_envio: string;
  nodo_procesado: string;
  nombre_cliente?: string;
  email_cliente?: string;
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  id_detalle?: number;
  id_pedido?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  nombre_producto?: string;
}

export interface PedidoCreate {
  cliente_id: number;
  direccion_envio: string;
  detalles: DetallePedido[];
}