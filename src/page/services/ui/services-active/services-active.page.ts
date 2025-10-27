import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicesActiveStore, ServiceWithDetails } from '../../model/services-active.store';
import { ServiceStatusEnum } from '../../../../entities/equipment-service';
import { ServiceTypeEnum, EquipmentTypeEnum } from '../../../../shared/model';
import { Ripple } from 'primeng/ripple';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-services-active',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Ripple,
    EmptyStateComponent,
    ConfirmationModalComponent
  ],
  providers: [ServicesActiveStore],
  templateUrl: './services-active.page.html'
})
export class ServicesActivePage implements OnInit {
  readonly store = inject(ServicesActiveStore);
  readonly router = inject(Router);

  // Expose enums to template
  readonly ServiceStatusEnum = ServiceStatusEnum;
  readonly ServiceTypeEnum = ServiceTypeEnum;
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  // Modal state
  readonly showCancelModal = signal(false);
  readonly serviceToCancelSignal = signal<ServiceWithDetails | null>(null);
  readonly isCancelling = signal(false);

  ngOnInit(): void {
    this.store.loadServices();
  }

  // ==================== NAVIGATION ====================

  onServiceClick(service: ServiceWithDetails): void {
    const role = this.store.userRole();

    if (role === 'OPERATOR') {
      // Operador va al stepper de trabajo
      this.router.navigate(['/services/work', service.id]);
    } else {
      // Admin y Client Viewer van al detalle
      this.router.navigate(['/services/active', service.id]);
    }
  }

  onCreateNew(): void {
    this.router.navigate(['/services/new']);
  }

  // ==================== FILTERS ====================

  onStatusFilterChange(status: ServiceStatusEnum | 'all'): void {
    this.store.setStatusFilter(status);
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

  // ==================== ACTIONS ====================

  onCancelClick(service: ServiceWithDetails, event: Event): void {
    event.stopPropagation(); // Evitar que se dispare el click del row
    this.serviceToCancelSignal.set(service);
    this.showCancelModal.set(true);
  }

  async confirmCancel(): Promise<void> {
    const service = this.serviceToCancelSignal();
    if (!service) return;

    this.isCancelling.set(true);

    const success = await this.store.cancelService(service.id);

    if (success) {
      this.closeCancelModal();
    }

    this.isCancelling.set(false);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.serviceToCancelSignal.set(null);
    this.isCancelling.set(false);
  }

  onReassignClick(service: ServiceWithDetails, event: Event): void {
    event.stopPropagation();
    // TODO: Abrir modal de reasignación
    console.log('🔄 Reasignar operador para servicio:', service.id);
  }

  // ==================== PAGINATION ====================

  onPreviousPage(): void {
    this.store.previousPage();
  }

  onNextPage(): void {
    this.store.nextPage();
  }

  onPageClick(page: number): void {
    this.store.goToPage(page);
  }

  // ==================== HELPERS ====================

  onRefresh(): void {
    this.store.loadServices();
  }

  getStatusBadgeClass(status: ServiceStatusEnum): string {
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';

    switch (status) {
      case ServiceStatusEnum.CREATED:
        return `${baseClasses} bg-gray-100 text-gray-700`;
      case ServiceStatusEnum.IN_PROGRESS:
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case ServiceStatusEnum.PAUSED:
        return `${baseClasses} bg-amber-100 text-amber-700`;
      case ServiceStatusEnum.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-700`;
      case ServiceStatusEnum.CANCELLED:
        return `${baseClasses} bg-rose-100 text-rose-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  }

  getStatusLabel(status: ServiceStatusEnum): string {
    const labels: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'Creado',
      [ServiceStatusEnum.IN_PROGRESS]: 'En Progreso',
      [ServiceStatusEnum.PAUSED]: 'Pausado',
      [ServiceStatusEnum.COMPLETED]: 'Completado',
      [ServiceStatusEnum.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: ServiceStatusEnum): string {
    const icons: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'pi pi-circle',
      [ServiceStatusEnum.IN_PROGRESS]: 'pi pi-spin pi-spinner',
      [ServiceStatusEnum.PAUSED]: 'pi pi-pause',
      [ServiceStatusEnum.COMPLETED]: 'pi pi-check-circle',
      [ServiceStatusEnum.CANCELLED]: 'pi pi-times-circle'
    };
    return icons[status] || 'pi pi-circle';
  }

  getServiceTypeLabel(type: ServiceTypeEnum): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento'
    };
    return labels[type] || type;
  }

  getEquipmentTypeIcon(type: EquipmentTypeEnum): string {
    return type === EquipmentTypeEnum.CABINET ? 'pi pi-clone' : 'pi pi-th-large';
  }

  getEquipmentTypeLabel(type: EquipmentTypeEnum): string {
    return type === EquipmentTypeEnum.CABINET ? 'Cabinet' : 'Panel';
  }

  formatDate(date: Date | null): string {
    if (!date) return '-';

    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1h';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short'
    });
  }

  formatDuration(duration: string | null): string {
    if (!duration) return '-';
    // Asumiendo formato "HH:MM:SS"
    const parts = duration.split(':');
    if (parts.length !== 3) return duration;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
