import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cliente, ClienteCreate } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<void>();

  clientes: Cliente[] = [];
  loading = false;
  mostrarModal = false;
  modoEdicion = false;
  clienteEditando: Cliente | null = null;

  // Formulario cliente
  formularioCliente: ClienteCreate = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.apiService.getClientes().subscribe({
      next: (data) => {
        if (data.success) {
          this.clientes = data.clientes;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.mostrarError('Error al cargar clientes');
        this.loading = false;
      }
    });
  }

  abrirModalNuevoCliente(): void {
    this.modoEdicion = false;
    this.clienteEditando = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditarCliente(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteEditando = cliente;
    this.formularioCliente = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.clienteEditando = null;
    this.limpiarFormulario();
  }

  guardarCliente(): void {
    if (this.modoEdicion) {
      this.actualizarCliente();
    } else {
      this.crearCliente();
    }
  }

  crearCliente(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.apiService.createCliente(this.formularioCliente).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Cliente creado exitosamente');
          this.cerrarModal();
          this.cargarClientes();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al crear cliente');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al crear cliente');
      }
    });
  }

  actualizarCliente(): void {
    if (!this.validarFormulario() || !this.clienteEditando) {
      return;
    }

    this.apiService.updateCliente(this.clienteEditando.id_cliente, this.formularioCliente).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Cliente actualizado exitosamente');
          this.cerrarModal();
          this.cargarClientes();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al actualizar cliente');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al actualizar cliente');
      }
    });
  }

  eliminarCliente(id: number): void {
    if (!confirm('¿Está seguro de eliminar este cliente?')) {
      return;
    }

    this.apiService.deleteCliente(id).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarExito('Cliente eliminado exitosamente');
          this.cargarClientes();
          this.dataChanged.emit();
        } else {
          this.mostrarError(data.error || 'Error al eliminar cliente');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarError('Error al eliminar cliente');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.formularioCliente.nombre || !this.formularioCliente.email) {
      this.mostrarError('Por favor complete los campos obligatorios');
      return false;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formularioCliente.email)) {
      this.mostrarError('Por favor ingrese un email válido');
      return false;
    }

    return true;
  }

  limpiarFormulario(): void {
    this.formularioCliente = {
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    };
  }

  mostrarExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  mostrarError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }
}