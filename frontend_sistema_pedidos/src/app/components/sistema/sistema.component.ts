import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NodoReplica } from '../../models/nodo.model';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.css']
})
export class SistemaComponent implements OnInit, OnDestroy {
  nodoActual = 'nodo1';
  replicas: NodoReplica[] = [];
  loading = false;

  // Replicación
  replicacionEnProceso = false;
  resultadosReplicacion: any[] = [];
  logsReplicados = 0;

  // Info del sistema
  infoSistema: any = null;

  private refreshInterval: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.cargarDatosSistema();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarDatosSistema(): void {
    this.verificarNodos();
    this.obtenerInfoSistema();
  }

  verificarNodos(): void {
    this.loading = true;
    this.apiService.verificarReplicas().subscribe({
      next: (data) => {
        if (data.success) {
          this.nodoActual = data.nodo_actual;
          this.replicas = data.replicas;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al verificar nodos:', err);
        this.mostrarError('Error al verificar estado de nodos');
        this.loading = false;
      }
    });
  }

  obtenerInfoSistema(): void {
    this.apiService.getInfo().subscribe({
      next: (data) => {
        if (data.success) {
          this.infoSistema = data;
        }
      },
      error: (err) => {
        console.error('Error al obtener info del sistema:', err);
      }
    });
  }

  ejecutarReplicacion(): void {
    this.replicacionEnProceso = true;
    this.resultadosReplicacion = [];
    this.logsReplicados = 0;

    this.apiService.ejecutarReplicacion().subscribe({
      next: (data) => {
        this.replicacionEnProceso = false;

        if (data.success) {
          this.logsReplicados = data.logs_replicados || 0;
          this.resultadosReplicacion = data.resultados || [];

          if (this.logsReplicados > 0) {
            this.mostrarExito(`Replicación completada: ${this.logsReplicados} logs procesados`);
          } else {
            this.mostrarInfo('No hay logs pendientes para replicar');
          }
        } else {
          this.mostrarError(data.message || 'Error en la replicación');
        }
      },
      error: (err) => {
        console.error('Error al ejecutar replicación:', err);
        this.mostrarError('Error al ejecutar replicación');
        this.replicacionEnProceso = false;
      }
    });
  }

  iniciarAutoRefresh(): void {
    // Auto-refresh cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.verificarNodos();
    }, 30000);
  }

  getEstadoColor(estado: string): string {
    return estado === 'activo' ? '#28a745' : '#dc3545';
  }

  getEstadoBadgeClass(estado: string): string {
    return estado === 'activo' ? 'bg-success' : 'bg-danger';
  }

  getEstadoIcon(estado: string): string {
    return estado === 'activo' ? 'fa-check-circle' : 'fa-times-circle';
  }

  contarNodosActivos(): number {
    return this.replicas.filter(r => r.estado === 'activo').length + 1; // +1 por el nodo actual
  }

  mostrarExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  mostrarError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }

  mostrarInfo(mensaje: string): void {
    alert('ℹ️ ' + mensaje);
  }
}