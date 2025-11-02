import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentServiceEntity, ServiceStatusEnum } from '../../../../entities/equipment-service';
import { SupervisorEntity } from '../../../../entities/supervisor';
import { ServiceTypeEnum } from '../../../../shared/model';

@Component({
  selector: 'app-service-info-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">

      <!-- Header -->
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100">
          <i class="pi pi-file-edit text-xl text-sky-600"></i>
        </div>
        <h2 class="text-lg font-semibold text-gray-900">
          Información del Servicio
        </h2>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-4 md:grid-cols-2">

        <!-- Tipo de Servicio -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Tipo de Servicio
          </label>
          <p class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <i [class]="getServiceTypeIcon()" class="text-sky-600"></i>
            {{ getServiceTypeLabel() }}
          </p>
        </div>

        <!-- Estado -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Estado
          </label>
          <div class="mt-1">
            <span [class]="getStatusBadgeClass()">
              <i [class]="getStatusIcon()"></i>
              {{ getStatusLabel() }}
            </span>
          </div>
        </div>

        <!-- Supervisor -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Supervisor
          </label>
          <p class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <i class="pi pi-user text-gray-600"></i>
            {{ supervisor?.fullName || 'N/A' }}
          </p>
        </div>

        <!-- Fecha de Creación -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Fecha de Creación
          </label>
          <p class="flex items-center gap-2 text-base text-gray-900">
            <i class="pi pi-calendar text-gray-600"></i>
            {{ formatDate(service.createdAt) }}
          </p>
        </div>

        <!-- Duración (si está en progreso o completado) -->
        @if (service.status !== ServiceStatusEnum.CREATED && service.startedAt) {
          <div class="rounded-lg bg-gray-50 p-4">
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Duración
            </label>
            <p class="flex items-center gap-2 text-base text-gray-900">
              <i class="pi pi-clock text-gray-600"></i>
              {{ service.totalWorkDuration || 'Calculando...' }}
            </p>
          </div>
        }

      </div>

    </div>
  `
})
export class ServiceInfoCardComponent {
  @Input({ required: true }) service!: EquipmentServiceEntity;
  @Input() supervisor: SupervisorEntity | null = null;

  // Expose enum
  readonly ServiceStatusEnum = ServiceStatusEnum;

  getServiceTypeLabel(): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
    };
    return labels[this.service.type] || this.service.type;
  }

  getServiceTypeIcon(): string {
    const icons: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'pi pi-wrench',
      [ServiceTypeEnum.INSPECTION]: 'pi pi-search',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'pi pi-exclamation-triangle'
    };
    return icons[this.service.type] || 'pi pi-file';
  }

  getStatusLabel(): string {
    const labels: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'Creado',
      [ServiceStatusEnum.IN_PROGRESS]: 'En Progreso',
      [ServiceStatusEnum.COMPLETED]: 'Completado',
      [ServiceStatusEnum.CANCELLED]: 'Cancelado'
    };
    return labels[this.service.status] || this.service.status;
  }

  getStatusIcon(): string {
    const icons: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'pi pi-circle',
      [ServiceStatusEnum.IN_PROGRESS]: 'pi pi-spin pi-spinner',
      [ServiceStatusEnum.COMPLETED]: 'pi pi-check-circle',
      [ServiceStatusEnum.CANCELLED]: 'pi pi-times-circle'
    };
    return icons[this.service.status] || 'pi pi-circle';
  }

  getStatusBadgeClass(): string {
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium';

    const statusClasses: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'bg-gray-100 text-gray-700',
      [ServiceStatusEnum.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
      [ServiceStatusEnum.COMPLETED]: 'bg-green-100 text-green-700',
      [ServiceStatusEnum.CANCELLED]: 'bg-rose-100 text-rose-700'
    };

    return `${baseClasses} ${statusClasses[this.service.status] || 'bg-gray-100 text-gray-700'}`;
  }

  formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
