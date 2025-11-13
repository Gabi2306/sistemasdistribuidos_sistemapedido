import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Producto, ProductoCreate } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<void>();

  productos: Producto[] = [];
  loading = false;
  mostrarModal = false;
  modoEdicion = false;
  productoEditando: Producto | null = null;

  // Formulario producto
  formularioProducto: ProductoCreate = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.apiService.getProductos().subscribe({
      next: (data) => {
        if (data.success) {
          this.productos = data.productos;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarError('Error al cargar productos');
        this.loading = false;
      }
    });
  }

  abrirModalNuevoProducto(): void {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoEditando = producto;
    this.formularioProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.productoEditando = null;
    this.limpiarFormulario();
  }

  guardarProducto(): void {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.apiService.createProducto(this.formularioProducto).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Producto creado exitosamente');
          this.cerrarModal();
          this.cargarProductos();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al crear producto');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al crear producto');
      }
    });
  }

  actualizarProducto(): void {
    if (!this.validarFormulario() || !this.productoEditando) {
      return;
    }

    this.apiService.updateProducto(this.productoEditando.id_producto, this.formularioProducto).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Producto actualizado exitosamente');
          this.cerrarModal();
          this.cargarProductos();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al actualizar producto');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al actualizar producto');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.formularioProducto.nombre) {
      this.mostrarError('Por favor ingrese el nombre del producto');
      return false;
    }

    if (this.formularioProducto.precio <= 0) {
      this.mostrarError('El precio debe ser mayor a 0');
      return false;
    }

    if (this.formularioProducto.stock < 0) {
      this.mostrarError('El stock no puede ser negativo');
      return false;
    }

    return true;
  }

  limpiarFormulario(): void {
    this.formularioProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0
    };
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  mostrarExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  mostrarError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }
}