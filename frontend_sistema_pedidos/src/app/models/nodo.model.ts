export interface NodoReplica {
  url: string;
  estado: 'activo' | 'inactivo';
  nodo?: string;
  error?: string;
}

export interface EstadisticasSistema {
  total_pedidos: number;
  por_estado: any[];
  total_facturado: number;
  por_nodo: any[];
}