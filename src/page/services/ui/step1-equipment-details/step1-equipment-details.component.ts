import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PanelEntity} from '../../../../entities/panel/model';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {
  getEquipmentStatusBadgeClass, getEquipmentStatusIcon,
  getEquipmentStatusLabel, toEquipmentStatus
} from '../../../../entities/equipment/model/equipment-status.enum';

@Component({
  selector: 'app-step1-equipment-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">

      <!-- Equipment Overview -->
      <div class="rounded-xl border border-gray-200 bg-white p-6">

        <!-- Header -->
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
              <i [class]="'pi text-xl text-cyan-600 ' + getEquipmentIcon()"></i>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500">{{ getEquipmentTypeLabel() }}</p>
              <p class="font-mono text-xl font-bold text-gray-900">{{ equipment().tag }}</p>
            </div>
          </div>

          <!-- Estado Badge -->
          <span [class]="getStatusBadgeClass()">
            <i [class]="'pi text-xs ' + getStatusIcon()"></i>
            {{ getStatusLabel() }}
          </span>
        </div>

        <!-- Info Grid -->
        <div class="space-y-3">

          <!-- Tipo Específico -->
          <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span class="text-sm font-medium text-gray-600">Tipo</span>
            <span class="font-semibold text-gray-900">{{ getSpecificType() }}</span>
          </div>

          <!-- Protocolo -->
          <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span class="text-sm font-medium text-gray-600">Protocolo</span>
            <span class="flex items-center gap-2 font-semibold text-gray-900">
              <i class="pi pi-wifi text-sky-500"></i>
              {{ equipment().communicationProtocol || 'N/A' }}
            </span>
          </div>

          <!-- Ubicación (si existe) -->
          @if (equipment().referenceLocation) {
            <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span class="text-sm font-medium text-gray-600">Ubicación</span>
              <span class="font-semibold text-gray-900">{{ equipment().referenceLocation }}</span>
            </div>
          }

        </div>
      </div>

      <!-- Power Distribution (Accordion) -->
      @if (powerDistributions().length > 0) {
        <div class="rounded-xl border border-gray-200 bg-white">

          <!-- Accordion Header -->
          <button
            (click)="togglePowerDistribution()"
            class="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <i class="pi pi-bolt text-lg text-amber-600"></i>
              </div>
              <div>
                <p class="font-semibold text-gray-900">Paneles de Distribución</p>
                <p class="text-xs text-gray-600">{{ powerDistributions().length }} panel(es) asignado(s)</p>
              </div>
            </div>
            <i class="pi text-gray-400 transition-transform"
               [class.pi-chevron-down]="!showPowerDistribution()"
               [class.pi-chevron-up]="showPowerDistribution()"
               [class.rotate-180]="showPowerDistribution()"></i>
          </button>

          <!-- Accordion Content -->
          @if (showPowerDistribution()) {
            <div class="border-t border-gray-200 p-5">
              <div class="space-y-3">
                @for (distribution of powerDistributions(); track distribution.id) {
                  @if (getPanelById(distribution.powerDistributionPanelId); as panel) {
                    <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-amber-300">

                      <!-- Panel Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <i class="pi pi-box text-amber-600"></i>
                          <span class="font-mono font-bold text-gray-900">{{ panel.code }}</span>
                        </div>
                        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
                          {{ distribution.circuitAssignments.length }} circuitos
                        </span>
                      </div>

                      <!-- Circuits -->
                      <div class="mt-3 flex flex-wrap gap-1.5">
                        @for (circuit of distribution.circuitAssignments; track circuit) {
                          <span class="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            {{ circuit }}
                          </span>
                        }
                      </div>

                    </div>
                  }
                }
              </div>
            </div>
          }

        </div>
      }

    </div>
  `
})
export class Step1EquipmentDetailsComponent {
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly equipmentType = input.required<EquipmentTypeEnum>();
  readonly powerDistributions = input.required<EquipmentPowerDistributionAssignmentEntity[]>();
  readonly powerPanels = input.required<Map<string, PowerDistributionPanelEntity>>();

  readonly showPowerDistribution = signal(false);

  togglePowerDistribution(): void {
    this.showPowerDistribution.set(!this.showPowerDistribution());
  }

  getEquipmentTypeLabel(): string {
    return this.equipmentType() === EquipmentTypeEnum.CABINET ? 'Gabinete' : 'Panel';
  }

  getEquipmentIcon(): string {
    return this.equipmentType() === EquipmentTypeEnum.CABINET ? 'pi-clone' : 'pi-th-large';
  }

  getSpecificType(): string {
    const equipment = this.equipment();
    if (this.equipmentType() === EquipmentTypeEnum.CABINET) {
      return (equipment as CabinetEntity).cabinetType || 'N/A';
    } else {
      return (equipment as PanelEntity).panelType || 'N/A';
    }
  }

  getStatusLabel(): string {
    return getEquipmentStatusLabel(toEquipmentStatus(this.equipment().status));
  }

  getStatusBadgeClass(): string {
    return getEquipmentStatusBadgeClass(toEquipmentStatus(this.equipment().status));
  }

  getStatusIcon(): string {
    return getEquipmentStatusIcon(toEquipmentStatus(this.equipment().status));
  }

  getPanelById(panelId: string): PowerDistributionPanelEntity | undefined {
    return this.powerPanels().get(panelId);
  }
}
