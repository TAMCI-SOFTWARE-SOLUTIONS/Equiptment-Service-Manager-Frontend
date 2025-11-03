import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';

@Component({
  selector: 'app-location-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white">

      <!-- Accordion Header -->
      <button
        (click)="toggle()"
        class="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-gray-50">

        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <i class="pi pi-map-marker text-lg text-emerald-600"></i>
          </div>
          <div>
            <p class="font-semibold text-gray-900">Ubicación y Distribución</p>
            <p class="text-xs text-gray-600">
              {{ powerDistributions().length }} panel(es) de distribución
            </p>
          </div>
        </div>

        <i class="pi text-gray-400 transition-transform duration-200"
           [class.pi-chevron-down]="!isOpen()"
           [class.pi-chevron-up]="isOpen()"></i>
      </button>

      <!-- Accordion Content -->
      @if (isOpen()) {
        <div class="border-t border-gray-200 p-5">

          <!-- Equipment Info -->
          <div class="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
                <i [class]="'pi text-2xl text-cyan-600 ' + getEquipmentIcon()"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-gray-500">{{ getEquipmentTypeLabel() }}</p>
                <p class="font-mono text-xl font-bold text-gray-900">{{ equipment().tag }}</p>
              </div>
            </div>

            <!-- Location Details -->
            <div class="mt-4 grid gap-3 md:grid-cols-2">

              <!-- Ubicación de Referencia -->
              @if (equipment().referenceLocation) {
                <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3 md:col-span-2">
                  <i class="pi pi-map-marker text-gray-400"></i>
                  <div>
                    <p class="text-xs text-gray-500">Ubicación de Referencia</p>
                    <p class="font-semibold text-gray-900">{{ equipment().referenceLocation }}</p>
                  </div>
                </div>
              }

              <!-- Protocolo -->
              @if (equipment().communicationProtocol) {
                <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3">
                  <i class="pi pi-wifi text-gray-400"></i>
                  <div>
                    <p class="text-xs text-gray-500">Protocolo</p>
                    <p class="font-semibold text-gray-900">{{ equipment().communicationProtocol }}</p>
                  </div>
                </div>
              }

              <!-- Tipo Específico -->
              <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3">
                <i class="pi pi-tag text-gray-400"></i>
                <div>
                  <p class="text-xs text-gray-500">Tipo</p>
                  <p class="font-semibold text-gray-900">{{ getSpecificType() }}</p>
                </div>
              </div>

              <!-- Última Inspección -->
              @if (equipment().lastInspectionAt) {
                <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3">
                  <i class="pi pi-search text-gray-400"></i>
                  <div>
                    <p class="text-xs text-gray-500">Última Inspección</p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatDate(equipment().lastInspectionAt) }}</p>
                  </div>
                </div>
              }

              <!-- Último Mantenimiento -->
              @if (equipment().lastMaintenanceAt) {
                <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3">
                  <i class="pi pi-wrench text-gray-400"></i>
                  <div>
                    <p class="text-xs text-gray-500">Último Mantenimiento</p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatDate(equipment().lastMaintenanceAt) }}</p>
                  </div>
                </div>
              }

            </div>
          </div>

          <!-- Power Distribution -->
          @if (powerDistributions().length > 0) {
            <div>
              <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <i class="pi pi-bolt text-amber-600"></i>
                <span>Paneles de Distribución Eléctrica</span>
              </h4>

              <div class="space-y-3">
                @for (distribution of powerDistributions(); track distribution.id) {
                  @if (getPanelById(distribution.powerDistributionPanelId); as panel) {
                    <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">

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

                      <!-- Panel Details -->
                      @if (panel.code) {
                        <p class="mt-2 text-sm text-gray-700">{{ panel.code }}</p>
                      }

                      <!-- Circuits -->
                      <div class="mt-3 flex flex-wrap gap-1.5">
                        @for (circuit of distribution.circuitAssignments; track circuit) {
                          <span class="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-amber-200">
                            {{ circuit }}
                          </span>
                        }
                      </div>

                    </div>
                  }
                }
              </div>
            </div>
          } @else {
            <!-- No power distribution -->
            <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <i class="pi pi-bolt text-3xl text-gray-300"></i>
              <p class="mt-2 text-sm text-gray-600">Sin paneles de distribución asignados</p>
            </div>
          }

        </div>
      }

    </div>
  `
})
export class LocationAccordionComponent {
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly equipmentType = input.required<EquipmentTypeEnum>();
  readonly powerDistributions = input.required<EquipmentPowerDistributionAssignmentEntity[]>();
  readonly powerPanels = input.required<Map<string, PowerDistributionPanelEntity>>();

  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.set(!this.isOpen());
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

  formatDate(date: Date | null): string {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  }

  getPanelById(panelId: string): PowerDistributionPanelEntity | undefined {
    return this.powerPanels().get(panelId);
  }
}
