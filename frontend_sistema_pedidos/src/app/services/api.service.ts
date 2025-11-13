import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteCreate } from '../models/cliente.model';
import { Producto, ProductoCreate } from '../models/producto.model';
import { Pedido, PedidoCreate } from '../models/pedido.model';
import { NodoReplica } from '../models/nodo.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // ============================================
  // CLIENTES
  // ============================================

  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  getCliente(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/${id}`);
  }

  createCliente(cliente: ClienteCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, cliente, this.httpOptions);
  }

  updateCliente(id: number, cliente: ClienteCreate): Observable<any> {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, cliente, this.httpOptions);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  // ============================================
  // PRODUCTOS
  // ============================================

  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos`);
  }

  getProducto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/${id}`);
  }

  createProducto(producto: ProductoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto, this.httpOptions);
  }

  updateProducto(id: number, producto: ProductoCreate): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, producto, this.httpOptions);
  }

  // ============================================
  // PEDIDOS
  // ============================================

  getPedidos(limit: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos?limit=${limit}`);
  }

  getPedido(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/${id}`);
  }

  getPedidosPorCliente(clienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/cliente/${clienteId}`);
  }

  createPedido(pedido: PedidoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos`, pedido, this.httpOptions);
  }

  updateEstadoPedido(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${id}/estado`, { estado }, this.httpOptions);
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pedidos/${id}`);
  }

  // ============================================
  // SISTEMA / HEALTH
  // ============================================

  getInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info`);
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  getHealthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  getNodosActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health/nodos`);
  }

  verificarReplicas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health/verificar-replicas`);
  }

  // ============================================
  // REPLICACIÓN
  // ============================================

  getLogsPendientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/replicacion/logs/pendientes`);
  }

  ejecutarReplicacion(): Observable<any> {
    return this.http.post(`${this.apiUrl}/replicacion/replicar`, {}, this.httpOptions);
  }
}