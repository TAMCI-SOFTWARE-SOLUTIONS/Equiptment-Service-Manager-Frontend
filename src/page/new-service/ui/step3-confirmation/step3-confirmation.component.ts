import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { getEquipmentStatusLabel, getEquipmentStatusColor } from '../../../../entities/equipment/model/equipment-status.enum';
import { EquipmentStatusEnum } from '../../../../entities/equipment/model/equipment-status.enum';
import {CreateServiceStore} from '../../model/store/create-service.store';

@Component({
  selector: 'app-step3-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-900">
          Confirmar Servicio
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Revisa los detalles y asigna un supervisor
        </p>
      </div>

      @if (store.selectedEquipment()) {
        <div class="grid gap-6 lg:grid-cols-2">

          <!-- Card: Resumen del Servicio -->
          <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <i class="pi pi-file-check text-lg text-sky-600"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Resumen del Servicio
                </h3>
              </div>
            </div>

            <div class="p-6">
              <dl class="space-y-4">
                <!-- Tipo de Servicio -->
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tipo de Servicio
                  </dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">
                    {{ store.serviceTypeLabel() }}
                  </dd>
                </div>

                <!-- Equipo -->
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Equipo Seleccionado
                  </dt>
                  <dd class="mt-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">
                        {{ store.formData().selectedEquipmentType === EquipmentTypeEnum.CABINET ? '📦' : '📋' }}
                      </span>
                      <span class="font-semibold text-gray-900">
                        {{ store.selectedEquipment()?.tag }}
                      </span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Card: Información del Equipo -->
          <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <i class="pi pi-box text-lg text-sky-600"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Información del Equipo
                </h3>
              </div>
            </div>

            <div class="p-6">
              <dl class="space-y-4">
                <!-- Tag -->
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tag
                  </dt>
                  <dd class="mt-1 text-base font-semibold text-gray-900">
                    {{ store.selectedEquipment()?.tag }}
                  </dd>
                </div>

                <!-- Tipo -->
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tipo de Equipo
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ getEquipmentTypeName() }}
                  </dd>
                </div>

                <!-- Estado -->
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado Actual
                  </dt>
                  <dd class="mt-1">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                          [ngClass]="getStatusClasses(store.selectedEquipment()?.status)">
                      <span class="h-1.5 w-1.5 rounded-full"
                            [ngClass]="getStatusIndicatorClass(store.selectedEquipment()?.status)"></span>
                      {{ getStatusLabel(store.selectedEquipment()?.status) }}
                    </span>
                  </dd>
                </div>

                <!-- Protocolo de Comunicación -->
                @if (store.selectedEquipment()?.communicationProtocol) {
                  <div>
                    <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Protocolo de Comunicación
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ store.selectedEquipment()?.communicationProtocol }}
                    </dd>
                  </div>
                }

                <!-- Fechas -->
                @if (store.selectedEquipment()?.createdAt) {
                  <div>
                    <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Fecha de Creación
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ store.selectedEquipment()?.createdAt | date:'medium' }}
                    </dd>
                  </div>
                }

                @if (store.selectedEquipment()?.lastServiceAt) {
                  <div>
                    <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Última Revisión
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ store.selectedEquipment()?.lastServiceAt | date:'medium' }}
                    </dd>
                  </div>
                } @else {
                  <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div class="flex items-start gap-2">
                      <i class="pi pi-exclamation-triangle mt-0.5 text-sm text-amber-600"></i>
                      <p class="text-xs text-amber-900">
                        Sin registro de última revisión
                      </p>
                    </div>
                  </div>
                }
              </dl>
            </div>
          </div>

          <!-- Card: Asignar Supervisor (Full width) -->
          <div class="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            <div class="border-b border-gray-100 p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <i class="pi pi-user text-lg text-sky-600"></i>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Supervisor del Servicio
                  </h3>
                  <p class="mt-0.5 text-sm text-gray-600">
                    Ingresa el nombre del supervisor responsable
                  </p>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="space-y-2">
                <label for="supervisorName" class="block text-sm font-medium text-gray-700">
                  Nombre del Supervisor
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="supervisorName"
                  type="text"
                  [value]="store.formData().supervisorName"
                  (input)="onSupervisorNameChange($any($event.target).value)"
                  placeholder="Ej: Juan Pérez García"
                  class="block w-full rounded-lg border py-2.5 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
                  [ngClass]="{
                    'border-red-500 focus:border-red-500 focus:ring-red-500/20': store.validationErrors().supervisorName,
                    'border-gray-300 focus:border-sky-500 focus:ring-sky-500/20': !store.validationErrors().supervisorName
                  }">

                @if (store.validationErrors().supervisorName) {
                  <p class="mt-1.5 flex items-start text-xs text-red-600">
                    <i class="pi pi-exclamation-circle mr-1.5 mt-0.5 text-xs"></i>
                    {{ store.validationErrors().supervisorName }}
                  </p>
                } @else if (store.formData().supervisorName.trim().length >= 3) {
                  <p class="mt-1.5 flex items-start text-xs text-green-600">
                    <i class="pi pi-check-circle mr-1.5 mt-0.5 text-xs"></i>
                    Nombre válido
                  </p>
                }

                <p class="text-xs text-gray-500">
                  <i class="pi pi-info-circle mr-1"></i>
                  Solo se permiten letras y espacios. Mínimo 3 caracteres.
                </p>
              </div>
            </div>
          </div>

        </div>
      } @else {
        <!-- Error state: No equipment selected -->
        <div class="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 text-center">
          <i class="pi pi-exclamation-triangle mb-4 text-5xl text-red-400"></i>
          <h3 class="text-lg font-semibold text-red-900">
            No hay equipo seleccionado
          </h3>
          <p class="mt-2 text-sm text-red-700">
            Por favor, regresa al paso anterior y selecciona un equipo.
          </p>
        </div>
      }

    </div>
  `
})
export class Step3ConfirmationComponent {
  readonly store = inject(CreateServiceStore);

  // Expose enum
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  onSupervisorNameChange(value: string): void {
    this.store.setSupervisorName(value);
  }

  getStatusLabel(status: any): string {
    if (!status) return 'Desconocido';
    return getEquipmentStatusLabel(status as EquipmentStatusEnum);
  }

  getStatusClasses(status: any): string {
    if (!status) return 'bg-gray-100 text-gray-700 border border-gray-200';

    const colors = getEquipmentStatusColor(status as EquipmentStatusEnum);
    return `${colors.bg} ${colors.text} ${colors.border} border`;
  }

  getStatusIndicatorClass(status: any): string {
    if (!status) return 'bg-gray-500';

    const colors = getEquipmentStatusColor(status as EquipmentStatusEnum);
    return colors.indicator;
  }

  getEquipmentTypeName(): string {
    const equipment = this.store.selectedEquipment();
    const equipmentType = this.store.formData().selectedEquipmentType;

    if (!equipment) return 'No especificado';

    if (equipmentType === EquipmentTypeEnum.CABINET) {
      return (equipment as any).cabinetType || 'No especificado';
    } else {
      return (equipment as any).panelType || 'No especificado';
    }
  }
}
