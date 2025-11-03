import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EquipmentServiceEntity,
  getStatusBadgeClass, getStatusIcon,
  getStatusLabel,
  ServiceStatusEnum
} from '../../../../entities/equipment-service';
import {SupervisorEntity} from '../../../../entities/supervisor';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {ServiceTypeEnum} from '../../../../shared/model';
import {DateUtils} from '../../../../shared/utils/DateUtils';

@Component({
  selector: 'app-details-hero-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- HERO CARD -->
    <div class="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 text-white shadow-xl lg:p-8">

      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-details" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-details)" />
        </svg>
      </div>

      <!-- Content -->
      <div class="relative">

        <!-- Header -->
        <div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div class="flex-1">
            <!-- Estado Badge -->
            <div class="mb-3">
              <span [class]="getStatusBadgeClass()">
                <i [class]="'pi text-xs ' + getStatusIcon()"></i>
                {{ getStatusLabel() }}
              </span>
            </div>

            <!-- Título -->
            <h1 class="text-3xl font-bold lg:text-4xl">
              {{ getServiceTypeLabel() }}
            </h1>
            <p class="mt-2 text-lg text-white/90">
              Equipo: <span class="font-semibold">{{ equipment().tag }}</span>
            </p>
          </div>

          <!-- Service Icon -->
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm lg:h-20 lg:w-20">
            <i [class]="'pi text-3xl lg:text-4xl ' + getServiceTypeIcon()"></i>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

          <!-- Supervisor -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Supervisor</p>
            <p class="mt-1 truncate text-sm font-bold lg:text-base">{{ supervisor().fullName }}</p>
          </div>

          <!-- Operador -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Operador</p>
            <p class="mt-1 truncate text-sm font-bold lg:text-base">{{ operatorFullName() }}</p>
          </div>

          <!-- Fecha de Creación -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Creado</p>
            <p class="mt-1 text-sm font-bold lg:text-base">{{ formatDate(service().createdAt) }}</p>
          </div>

          <!-- Fecha de Completado o Duración -->
          @if (service().status === ServiceStatusEnum.COMPLETED) {
            <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p class="text-xs font-medium text-white/70">Completado</p>
              <p class="mt-1 text-sm font-bold lg:text-base">{{ formatDate(service().completedAt) }}</p>
            </div>
          } @else {
            <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p class="text-xs font-medium text-white/70">Estado</p>
              <p class="mt-1 text-sm font-bold lg:text-base">{{ getStatusLabel() }}</p>
            </div>
          }

        </div>

        <!-- Bottom Info (solo si está completado) -->
        @if (service().status === ServiceStatusEnum.COMPLETED && service().startedAt) {
          <div class="mt-6 flex items-center gap-6 rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-4 backdrop-blur-sm">
            <div class="flex items-center gap-2">
              <i class="pi pi-clock text-xl"></i>
              <div>
                <p class="text-xs text-white/70">Duración Total</p>
                <p class="font-bold">{{ getDuration() }}</p>
              </div>
            </div>

            <div class="h-8 w-px bg-white/20"></div>

            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-xl"></i>
              <div>
                <p class="text-xs text-white/70">Iniciado</p>
                <p class="font-bold">{{ formatDate(service().startedAt) }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Info adicional (si está cancelado) -->
        @if (service().status === ServiceStatusEnum.CANCELLED) {
          <div class="mt-6 flex items-start gap-3 rounded-xl border-2 border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
            <i class="pi pi-exclamation-circle text-xl text-red-300"></i>
            <div>
              <p class="font-semibold text-red-100">Servicio Cancelado</p>
              <p class="mt-1 text-sm text-red-200/80">
                Este servicio fue cancelado y no se pueden realizar cambios.
              </p>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class DetailsHeroCardComponent {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly supervisor = input.required<SupervisorEntity>();
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly operatorFullName = input.required<string>();

  readonly ServiceStatusEnum = ServiceStatusEnum;

  getStatusLabel(): string {
    return getStatusLabel(this.service().status);
  }

  getStatusBadgeClass(): string {
    return getStatusBadgeClass(this.service().status);
  }

  getStatusIcon(): string {
    return getStatusIcon(this.service().status);
  }

  getServiceTypeLabel(): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
    };
    return labels[this.service().type] || this.service().type;
  }

  getServiceTypeIcon(): string {
    const icons: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'pi-wrench',
      [ServiceTypeEnum.INSPECTION]: 'pi-search',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'pi-exclamation-triangle'
    };
    return icons[this.service().type] || 'pi-file';
  }

  formatDate(date: Date | null): string {
    return DateUtils.formatDateShort(date);
  }

  getDuration(): string {
    const service = this.service();
    return DateUtils.calculateDuration(service.startedAt, service.completedAt);
  }
}
