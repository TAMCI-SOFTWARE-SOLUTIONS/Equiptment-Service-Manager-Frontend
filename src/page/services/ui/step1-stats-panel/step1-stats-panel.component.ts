import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EquipmentServiceEntity} from '../../../../entities/equipment-service';
import {SupervisorEntity} from '../../../../entities/supervisor';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {DateUtils} from '../../../../shared/utils/DateUtils';
import {formatLastServiceDate, getLastServiceLabel} from '../../utils/service-date.helpers';

@Component({
  selector: 'app-step1-stats-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">

      <!-- Supervisor -->
      <div class="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-sky-300 hover:shadow-md">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
            <i class="pi pi-shield text-xl text-sky-600"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500">Supervisor</p>
            <p class="mt-0.5 truncate font-semibold text-gray-900">{{ supervisor().fullName }}</p>
          </div>
        </div>
      </div>

      <!-- Operador -->
      <div class="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <i class="pi pi-user-edit text-xl text-emerald-600"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500">Operador</p>
            <p class="mt-0.5 truncate font-semibold text-gray-900">{{ operatorFullName() }}</p>
          </div>
        </div>
      </div>

      <!-- Fecha de Creación -->
      <div class="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <i class="pi pi-calendar text-xl text-amber-600"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500">Fecha de Creación</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">
              {{ formatDate(service().createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Último Servicio (condicional según tipo) -->
      <div class="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-purple-300 hover:shadow-md">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
            <i class="pi pi-history text-xl text-purple-600"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500">{{ getLastServiceLabel() }}</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">
              {{ getLastServiceDate() }}
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class Step1StatsPanelComponent {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly supervisor = input.required<SupervisorEntity>();
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly operatorFullName = input.required<string>();

  formatDate(date: Date | null): string {
    return DateUtils.formatDateShort(date);
  }

  getLastServiceLabel(): string {
    return getLastServiceLabel(this.service().type);
  }

  getLastServiceDate(): string {
    return formatLastServiceDate(this.service().type, this.equipment());
  }
}
