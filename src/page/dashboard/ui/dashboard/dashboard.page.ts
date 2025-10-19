import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {DashboardStore} from '../../model/store/dashboard.store';

// Registrar Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit, AfterViewInit {
  readonly store = inject(DashboardStore);

  // Referencias a los canvas de los charts
  @ViewChild('equipmentByTypeChart') equipmentByTypeChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('equipmentByStatusChart') equipmentByStatusChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('maintenanceChart') maintenanceChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('repairChart') repairChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('operationalLiftChart') operationalLiftChart?: ElementRef<HTMLCanvasElement>;

  // Instancias de los charts
  private charts: { [key: string]: Chart } = {};

  ngOnInit(): void {
    this.store.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Esperar a que los datos estén cargados
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // ==================== REFRESH ====================

  async onRefresh(): Promise<void> {
    await this.store.refresh();
    this.updateCharts();
  }

  // ==================== CHARTS INITIALIZATION ====================

  private initializeCharts(): void {
    this.createEquipmentByTypeChart();
    this.createEquipmentByStatusChart();
    this.createMaintenanceChart();
    this.createRepairChart();
    this.createOperationalLiftChart();
  }

  private updateCharts(): void {
    Object.values(this.charts).forEach(chart => {
      chart.update();
    });
  }

  // ==================== EQUIPMENT BY TYPE CHART ====================

  private createEquipmentByTypeChart(): void {
    if (!this.equipmentByTypeChart) return;

    const ctx = this.equipmentByTypeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const stats = this.store.stats();

    this.charts['equipmentByType'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Gabinetes', 'Tableros'],
        datasets: [{
          label: 'Cantidad',
          data: [
            stats.equipmentByType.cabinets,
            stats.equipmentByType.panels
          ],
          backgroundColor: [
            'rgba(14, 165, 233, 0.8)', // sky-500
            'rgba(6, 182, 212, 0.8)'   // cyan-500
          ],
          borderColor: [
            'rgb(14, 165, 233)',
            'rgb(6, 182, 212)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // ==================== EQUIPMENT BY STATUS CHART ====================

  private createEquipmentByStatusChart(): void {
    if (!this.equipmentByStatusChart) return;

    const ctx = this.equipmentByStatusChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const stats = this.store.stats();

    this.charts['equipmentByStatus'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Operativo', 'En Espera', 'Inoperativo', 'Retirado'],
        datasets: [{
          data: [
            stats.equipmentByStatus.operative,
            stats.equipmentByStatus.standBy,
            stats.equipmentByStatus.inoperative,
            stats.equipmentByStatus.retired
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // green-500
            'rgba(251, 191, 36, 0.8)',  // amber-500
            'rgba(239, 68, 68, 0.8)',   // red-500
            'rgba(156, 163, 175, 0.8)'  // gray-400
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // ==================== MAINTENANCE CHART ====================

  private createMaintenanceChart(): void {
    if (!this.maintenanceChart) return;

    const ctx = this.maintenanceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const stats = this.store.stats().maintenanceStats;

    this.charts['maintenance'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En Progreso', 'Pausado', 'Completado', 'Cancelado'],
        datasets: [{
          data: [
            stats.inProgress,
            stats.paused,
            stats.completed,
            stats.cancelled
          ],
          backgroundColor: [
            'rgba(14, 165, 233, 0.8)',  // sky-500
            'rgba(251, 191, 36, 0.8)',  // amber-500
            'rgba(34, 197, 94, 0.8)',   // green-500
            'rgba(156, 163, 175, 0.8)'  // gray-400
          ],
          borderColor: [
            'rgb(14, 165, 233)',
            'rgb(251, 191, 36)',
            'rgb(34, 197, 94)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // ==================== REPAIR CHART ====================

  private createRepairChart(): void {
    if (!this.repairChart) return;

    const ctx = this.repairChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const stats = this.store.stats().repairStats;

    this.charts['repair'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En Progreso', 'Pausado', 'Completado', 'Cancelado'],
        datasets: [{
          data: [
            stats.inProgress,
            stats.paused,
            stats.completed,
            stats.cancelled
          ],
          backgroundColor: [
            'rgba(14, 165, 233, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(14, 165, 233)',
            'rgb(251, 191, 36)',
            'rgb(34, 197, 94)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // ==================== OPERATIONAL LIFT CHART ====================

  private createOperationalLiftChart(): void {
    if (!this.operationalLiftChart) return;

    const ctx = this.operationalLiftChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const stats = this.store.stats().operationalLiftStats;

    this.charts['operationalLift'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En Progreso', 'Pausado', 'Completado', 'Cancelado'],
        datasets: [{
          data: [
            stats.inProgress,
            stats.paused,
            stats.completed,
            stats.cancelled
          ],
          backgroundColor: [
            'rgba(14, 165, 233, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(14, 165, 233)',
            'rgb(251, 191, 36)',
            'rgb(34, 197, 94)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // ==================== HELPERS ====================

  /**
   * Formatear fecha relativa
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Obtener icono según tipo de equipo
   */
  getEquipmentIcon(type: 'CABINET' | 'PANEL'): string {
    return type === 'CABINET' ? '🔧' : '📋';
  }

  /**
   * Obtener color según tipo de equipo
   */
  getEquipmentColor(type: 'CABINET' | 'PANEL'): string {
    return type === 'CABINET'
      ? 'bg-sky-100 text-sky-700 border-sky-200'
      : 'bg-cyan-100 text-cyan-700 border-cyan-200';
  }

  /**
   * Cleanup de charts al destruir componente
   */
  ngOnDestroy(): void {
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
  }
}
