import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EquipmentServiceEntity,
  getStatusIcon,
  getStatusLabel,
  ServiceStatusEnum
} from '../../../../entities/equipment-service';
import {SupervisorEntity} from '../../../../entities/supervisor';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {ServiceTypeEnum} from '../../../../shared/model';
import {DateUtils} from '../../../../shared/utils/DateUtils';

@Component({
  selector: 'app-step1-hero-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- HERO CARD -->
    <div class="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-600 p-6 text-white shadow-xl lg:p-8">

      <!-- Background Pattern (opcional, decorativo) -->
      <div class="absolute inset-0 opacity-5">
        <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <!-- Content -->
      <div class="relative">

        <!-- Header: Estado + Tipo -->
        <div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div class="flex-1">
            <!-- Estado Badge -->
            <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <i [class]="'pi text-xs ' + getStatusIcon()"></i>
              <span>{{ getStatusLabel() }}</span>
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

        <!-- Stats Row -->
        <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

          <!-- Stat 1: Supervisor -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Supervisor</p>
            <p class="mt-1 truncate text-sm font-bold lg:text-base">{{ supervisor().fullName }}</p>
          </div>

          <!-- Stat 2: Items a Inspeccionar -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Items</p>
            <p class="mt-1 text-2xl font-bold">{{ totalItems() }}</p>
          </div>

          <!-- Stat 3: Duración -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Duración</p>
            <p class="mt-1 text-sm font-bold lg:text-base">{{ getDuration() }}</p>
          </div>

          <!-- Stat 4: Circuitos -->
          <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p class="text-xs font-medium text-white/70">Circuitos</p>
            <p class="mt-1 text-2xl font-bold">{{ totalCircuits() }}</p>
          </div>

        </div>

        <!-- Call-out: Listo para comenzar (solo si CREATED) -->
        @if (service().status === ServiceStatusEnum.CREATED) {
          <div class="mt-6 flex items-start gap-3 rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-4 backdrop-blur-sm">
            <i class="pi pi-info-circle text-2xl"></i>
            <div class="flex-1">
              <p class="font-semibold">Listo para comenzar</p>
              <p class="mt-0.5 text-sm text-white/90">
                Revisa la información y haz clic en "Comenzar" en el pie de página
              </p>
            </div>
            <i class="pi pi-arrow-down hidden animate-bounce text-xl lg:block"></i>
          </div>
        }

      </div>
    </div>
  `
})
export class Step1HeroCardComponent {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly supervisor = input.required<SupervisorEntity>();
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly totalItems = input.required<number>();
  readonly totalCircuits = input.required<number>();

  readonly ServiceStatusEnum = ServiceStatusEnum;

  getStatusLabel(): string {
    return getStatusLabel(this.service().status);
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

  getDuration(): string {
    const service = this.service();
    return DateUtils.calculateDuration(service.startedAt, service.completedAt);
  }
}
