import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Pedido, PedidoCreate, DetallePedido } from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<void>();

  pedidos: Pedido[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  loading = false;
  mostrarModal = false;
  mostrarModalDetalle = false;
  mostrarModalEstado = false;

  // Estados disponibles
  estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Formulario nuevo pedido
  nuevoPedido: PedidoCreate = {
    cliente_id: 0,
    direccion_envio: '',
    detalles: []
  };

  // Detalle del pedido para visualización
  pedidoDetalle: Pedido | null = null;

  // Para cambio de estado
  pedidoParaCambiarEstado: Pedido | null = null;
  nuevoEstadoSeleccionado = '';

  // Productos del pedido en edición
  productosDelPedido: DetallePedido[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarPedidos();
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.apiService.getPedidos().subscribe({
      next: (data) => {
        if (data.success) {
          this.pedidos = data.pedidos;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.mostrarError('Error al cargar pedidos');
        this.loading = false;
      }
    });
  }

  cargarClientes(): void {
    this.apiService.getClientes().subscribe({
      next: (data) => {
        if (data.success) {
          this.clientes = data.clientes;
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  cargarProductos(): void {
    this.apiService.getProductos().subscribe({
      next: (data) => {
        if (data.success) {
          this.productos = data.productos;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  abrirModalNuevoPedido(): void {
    if (this.clientes.length === 0) {
      this.mostrarError('No hay clientes registrados. Cree un cliente primero.');
      return;
    }
    if (this.productos.length === 0) {
      this.mostrarError('No hay productos registrados. Cree un producto primero.');
      return;
    }

    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.pedidoDetalle = null;
  }

  agregarProductoAlPedido(): void {
    this.productosDelPedido.push({
      id_producto: 0,
      cantidad: 1,
      precio_unitario: 0
    });
  }

  eliminarProductoPedido(index: number): void {
    this.productosDelPedido.splice(index, 1);
    this.calcularTotal();
  }

  onProductoChange(index: number): void {
    const detalle = this.productosDelPedido[index];
    const productoId = Number(detalle.id_producto); // Convertir a número
    const producto = this.productos.find(p => p.id_producto === productoId);

    if (producto) {
      this.productosDelPedido[index].precio_unitario = Number(producto.precio);
      this.productosDelPedido[index].id_producto = productoId; // Asegurar que sea número
    } else {
      this.productosDelPedido[index].precio_unitario = 0;
    }

    this.calcularTotal();
  }

  onCantidadChange(index: number): void {
    // Convertir a número
    this.productosDelPedido[index].cantidad = Number(this.productosDelPedido[index].cantidad);
    this.calcularTotal();
  }

  calcularTotal(): number {
    let total = 0;
    this.productosDelPedido.forEach(detalle => {
      if (detalle.id_producto > 0 && detalle.cantidad > 0) {
        total += detalle.cantidad * detalle.precio_unitario;
      }
    });
    return total;
  }

  crearPedido(): void {
    if (!this.validarFormulario()) {
      return;
    }

    // Filtrar y convertir a números
    const detallesLimpios = this.productosDelPedido
      .filter(d => d.id_producto > 0)
      .map(d => ({
        id_producto: Number(d.id_producto),  // Convertir a número
        cantidad: Number(d.cantidad),        // Convertir a número
        precio_unitario: Number(d.precio_unitario) // Convertir a número
      }));

    const pedidoData: PedidoCreate = {
      cliente_id: Number(this.nuevoPedido.cliente_id), // Convertir a número
      direccion_envio: this.nuevoPedido.direccion_envio,
      detalles: detallesLimpios
    };

    console.log('Datos a enviar:', JSON.stringify(pedidoData, null, 2)); // DEBUG

    this.apiService.createPedido(pedidoData).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito(`Pedido #${data.pedido_id} creado exitosamente en ${data.nodo_procesado}`);
          this.cerrarModal();
          this.cargarPedidos();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al crear pedido');
        }
      },
      error: (err) => {
        console.error('Error completo:', err); // DEBUG
        this.mostrarError('Error al crear pedido: ' + (err.error?.error || err.message));
      }
    });
  }

  verDetallePedido(pedidoId: number): void {
    this.apiService.getPedido(pedidoId).subscribe({
      next: (data) => {
        if (data.success) {
          this.pedidoDetalle = data.pedido;
          this.mostrarModalDetalle = true;
        } else {
          this.mostrarError('Error al obtener detalles del pedido');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al obtener detalles del pedido');
      }
    });
  }

  abrirModalCambiarEstado(pedido: Pedido): void {
    this.pedidoParaCambiarEstado = pedido;
    this.nuevoEstadoSeleccionado = pedido.estado;
    this.mostrarModalEstado = true;
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
    this.pedidoParaCambiarEstado = null;
    this.nuevoEstadoSeleccionado = '';
  }

  confirmarCambioEstado(): void {
    if (!this.pedidoParaCambiarEstado || !this.nuevoEstadoSeleccionado) {
      return;
    }

    const pedidoId = this.pedidoParaCambiarEstado.id_pedido;

    this.apiService.updateEstadoPedido(pedidoId, this.nuevoEstadoSeleccionado).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Estado actualizado exitosamente');
          this.cerrarModalEstado();
          this.cargarPedidos();
        } else {
          this.mostrarError(data.error || 'Error al actualizar estado');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al actualizar estado');
      }
    });
  }

  eliminarPedido(pedidoId: number): void {
    if (!confirm('¿Está seguro de eliminar este pedido?')) {
      return;
    }

    this.apiService.deletePedido(pedidoId).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Pedido eliminado exitosamente');
          this.cargarPedidos();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al eliminar pedido');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al eliminar pedido');
      }
    });
  }

  validarFormulario(): boolean {
    if (this.nuevoPedido.cliente_id === 0) {
      this.mostrarError('Por favor seleccione un cliente');
      return false;
    }

    if (!this.nuevoPedido.direccion_envio) {
      this.mostrarError('Por favor ingrese la dirección de envío');
      return false;
    }

    if (this.productosDelPedido.length === 0) {
      this.mostrarError('Debe agregar al menos un producto');
      return false;
    }

    // Validar cada producto
    for (let i = 0; i < this.productosDelPedido.length; i++) {
      const detalle = this.productosDelPedido[i];

      if (detalle.id_producto === 0) {
        this.mostrarError(`Seleccione un producto en la línea ${i + 1}`);
        return false;
      }

      if (detalle.cantidad <= 0) {
        this.mostrarError(`La cantidad debe ser mayor a 0 en la línea ${i + 1}`);
        return false;
      }

      // Validar stock
      const producto = this.productos.find(p => p.id_producto === detalle.id_producto);
      if (producto && producto.stock < detalle.cantidad) {
        this.mostrarError(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
        return false;
      }
    }

    return true;
  }

  limpiarFormulario(): void {
    this.nuevoPedido = {
      cliente_id: 0,
      direccion_envio: '',
      detalles: []
    };
    this.productosDelPedido = [];
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'bg-warning',
      'en_proceso': 'bg-info',
      'enviado': 'bg-primary',
      'entregado': 'bg-success',
      'cancelado': 'bg-danger'
    };
    return clases[estado] || 'bg-secondary';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  getProductoStock(productoId: number): number {
    const producto = this.productos.find(p => p.id_producto === productoId);
    return producto ? producto.stock : 0;
  }

  mostrarExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  mostrarError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }
}