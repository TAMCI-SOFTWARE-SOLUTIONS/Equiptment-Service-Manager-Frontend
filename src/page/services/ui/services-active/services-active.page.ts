import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  getStatusBadgeClass,
  getStatusIcon,
  getStatusLabel,
  ServiceStatusEnum
} from '../../../../entities/equipment-service';
import { ServiceTypeEnum, EquipmentTypeEnum } from '../../../../shared/model';
import { Ripple } from 'primeng/ripple';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {DurationUtils} from '../../../../shared/utils/DurationUtils';
import {DateUtils} from '../../../../shared/utils/DateUtils';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import {getEquipmentTypeIcon, getEquipmentTypeLabel} from '../../../../shared/model/enums/equipment-type.enum';
import {getServiceTypeLabel} from '../../../../shared/model/service-type.enum';
import {ServicesActiveStore, ServiceWithDetails} from '../../model/store/services-active.store';

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

  readonly ServiceStatusEnum = ServiceStatusEnum;
  readonly ServiceTypeEnum = ServiceTypeEnum;
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly currentService = signal<ServiceWithDetails | null>(null);

  readonly showCancelModal = signal(false);
  readonly serviceToCancelSignal = signal<ServiceWithDetails | null>(null);
  readonly isCancelling = signal(false);

  protected readonly getEquipmentTypeIcon = getEquipmentTypeIcon;
  protected readonly getEquipmentTypeLabel = getEquipmentTypeLabel;
  protected readonly getServiceTypeLabel = getServiceTypeLabel;
  protected readonly getStatusIcon = getStatusIcon;
  protected readonly getStatusLabel = getStatusLabel;
  protected readonly getStatusBadgeClass = getStatusBadgeClass;

  ngOnInit(): void {
    if(this.router.url.includes('services/active')) {
      this.store.setIsActivePage(true);
    } else {
      this.store.setIsActivePage(false);
    }
    this.store.loadServices();
  }

  openMenu(event: Event, menu: Menu, service: ServiceWithDetails): void {
    this.currentService.set(service);
    menu.toggle(event);
  }

  getMenuItems(): MenuItem[] {
    const service = this.currentService();
    if (!service) return [];

    const items: MenuItem[] = [];

    items.push({
      label: (this.store.isOperator() && this.store.isActivePage()) ? 'Continuar servicio' : 'Ver detalles',
      icon: 'pi pi-eye',
      command: () => this.onServiceClick(service)
    });

    if ((this.store.isAdmin() || this.store.isOperator()) && this.store.isActivePage()) {
      items.push({ separator: true });

      items.push({
        label: 'Cancelar servicio',
        icon: 'pi pi-times',
        command: () => this.onCancelClickFromMenu(service),
        styleClass: 'text-rose-600'
      });
    }

    return items;
  }


  onServiceClick(service: ServiceWithDetails): void {
    if (!this.store.isActivePage() || this.store.isAdmin()) {
      this.router.navigate(['/services', service.id]).then();
    } else {
      this.router.navigate(['/services/work', service.id]).then();
    }
  }

  onCreateNew(): void {
    if (!this.store.isOperator()) return;
    this.router.navigate(['/services/new']).then();
  }


  onStatusFilterChange(status: ServiceStatusEnum | 'all'): void {
    this.store.setStatusFilter(status);
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

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

  onPageClick(page: number): void {
    this.store.goToPage(page);
  }

  onRefresh(): void {
    this.store.loadServices();
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
