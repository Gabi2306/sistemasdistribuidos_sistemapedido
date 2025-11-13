import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ClientesComponent } from '../clientes/clientes.component';
import { ProductosComponent } from '../productos/productos.component';
import { PedidosComponent } from '../pedidos/pedidos.component';
import { SistemaComponent } from '../sistema/sistema.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    ClientesComponent,
    ProductosComponent,
    PedidosComponent,
    SistemaComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  nodoActual = 'nodo1';
  totalPedidos = 0;
  totalClientes = 0;
  totalProductos = 0;
  nodosActivos = 1;

  activeTab = 'pedidos';

  private refreshInterval: any;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarDatosIniciales(): void {
    this.verificarNodos();
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.apiService.getClientes().subscribe({
      next: (data: any) => {
        if (data.success && data.clientes) {
          this.totalClientes = data.clientes.length;
        }
      },
      error: (err) => console.error('Error al cargar clientes:', err)
    });

    this.apiService.getProductos().subscribe({
      next: (data: any) => {
        if (data.success && data.productos) {
          this.totalProductos = data.productos.length;
        }
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });

    this.apiService.getPedidos().subscribe({
      next: (data: any) => {
        if (data.success && data.pedidos) {
          this.totalPedidos = data.pedidos.length;
        }
      },
      error: (err) => console.error('Error al cargar pedidos:', err)
    });
  }

  verificarNodos(): void {
    this.apiService.verificarReplicas().subscribe({
      next: (data: any) => {
        if (data.success) {
          this.nodoActual = data.nodo_actual || 'nodo1';
          if (data.replicas && Array.isArray(data.replicas)) {
            const activos = data.replicas.filter((r: any) => r.estado === 'activo').length;
            this.nodosActivos = activos + 1; // +1 por el nodo actual
          }
        }
      },
      error: (err) => {
        console.error('Error al verificar nodos:', err);
        this.nodosActivos = 1; // Solo el nodo actual si hay error
      }
    });
  }

  iniciarAutoRefresh(): void {
    // Auto-refresh cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.cargarEstadisticas();
      this.verificarNodos();
    }, 30000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  salir(): void {
    this.router.navigate(['/']);
  }

  onDataChanged(): void {
    // Callback para cuando los componentes hijos modifiquen datos
    this.cargarEstadisticas();
  }
}