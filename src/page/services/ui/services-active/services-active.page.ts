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
import {DurationUtils} from '../../../../shared/utils/DurationUtils';
import {DateUtils} from '../../../../shared/utils/DateUtils';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-services-active',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Ripple,
    EmptyStateComponent,
    ConfirmationModalComponent,
    Menu // ← NUEVO
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

  // ==================== MENU ACTIONS ====================

  /**
   * Obtener opciones del menú según rol y servicio
   */
  getMenuItems(service: ServiceWithDetails): MenuItem[] {
    const role = this.store.userRole();
    const items: MenuItem[] = [];

    // Opción principal: Ver/Continuar
    items.push({
      label: role === 'OPERATOR' ? 'Continuar servicio' : 'Ver detalles',
      icon: 'pi pi-eye',
      command: () => this.onServiceClick(service)
    });

    // Opciones solo para Admin
    if (this.store.canManageServices()) {
      items.push({ separator: true });

      items.push({
        label: 'Reasignar operador',
        icon: 'pi pi-user-edit',
        command: () => this.onReassignClick(service)
      });

      items.push({
        label: 'Cancelar servicio',
        icon: 'pi pi-times',
        command: () => this.onCancelClickFromMenu(service),
        styleClass: 'text-rose-600'
      });
    }

    return items;
  }

  // ==================== NAVIGATION ====================

  onServiceClick(service: ServiceWithDetails): void {
    const role = this.store.userRole();

    if (role === 'OPERATOR') {
      this.router.navigate(['/services/work', service.id]);
    } else {
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

  onCancelClickFromMenu(service: ServiceWithDetails): void {
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

  onReassignClick(service: ServiceWithDetails): void {
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
    return DateUtils.formatDateTime(date);
  }

  formatDuration(duration: string | null): string {
    if (!duration) return '-';
    return DurationUtils.formatReadable(duration);
  }
}
