import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentPowerDistributionAssignmentEntity } from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import { PowerDistributionPanelEntity } from '../../../../entities/power-distribution-panel/model';

@Component({
  selector: 'app-power-distribution-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (powerDistributions.length > 0) {
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">

        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
              <i class="pi pi-bolt text-xl text-amber-600"></i>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                Paneles de Distribución Eléctrica
              </h2>
              <p class="text-sm text-gray-600">
                {{ powerDistributions.length }} panel(es) asignado(s)
              </p>
            </div>
          </div>

          <!-- Total Circuits Badge -->
          <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
            <i class="pi pi-sitemap text-xs"></i>
            {{ getTotalCircuits() }} circuitos
          </span>
        </div>

        <!-- Panels List -->
        <div class="space-y-3">
          @for (distribution of powerDistributions; track distribution.id) {
            @if (getPanelById(distribution.powerDistributionPanelId); as panel) {
              <div class="group rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all hover:border-amber-300 hover:shadow-md">

                <div class="flex items-start justify-between gap-4">

                  <!-- Panel Info -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-box text-amber-600"></i>
                      <h3 class="font-mono text-base font-bold text-gray-900">
                        {{ panel.code }}
                      </h3>
                    </div>

                    <div class="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <!-- Type -->
                      <div class="flex items-center gap-2">
                        <span class="text-gray-500">Tipo:</span>
                        <span class="font-medium text-gray-900">{{ panel.type }}</span>
                      </div>

                      <!-- Location -->
                      <!--@if (panel.location) {
                        <div class="flex items-center gap-2">
                          <span class="text-gray-500">Ubicación:</span>
                          <span class="font-medium text-gray-900">{{ panel.location }}</span>
                        </div>
                      }-->

                      <!-- Voltage -->
                      <!--@if (panel.voltage) {
                        <div class="flex items-center gap-2">
                          <span class="text-gray-500">Voltaje:</span>
                          <span class="font-medium text-gray-900">{{ panel.voltage }}V</span>
                        </div>
                      }
                      -->
                       Capacity
                      <!--@if (panel.capacity) {
                        <div class="flex items-center gap-2">
                          <span class="text-gray-500">Capacidad:</span>
                          <span class="font-medium text-gray-900">{{ panel.capacity }}A</span>
                        </div>
                      }-->
                    </div>

                    <!-- Circuit Assignments -->
                    <div class="mt-3">
                      <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Circuitos Asignados ({{ distribution.circuitAssignments.length }})
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        @for (circuit of distribution.circuitAssignments; track circuit) {
                          <span class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            {{ circuit }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Circuit Count Badge -->
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-center">
                    <div>
                      <div class="text-xl font-bold text-amber-700">
                        {{ distribution.circuitAssignments.length }}
                      </div>
                      <div class="text-[10px] font-medium uppercase text-amber-600">
                        Circ.
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            }
          }
        </div>

      </div>
    }
  `
})
export class PowerDistributionListComponent {
  @Input({ required: true }) powerDistributions: EquipmentPowerDistributionAssignmentEntity[] = [];
  @Input({ required: true }) powerPanels!: Map<string, PowerDistributionPanelEntity>;

  getPanelById(panelId: string): PowerDistributionPanelEntity | undefined {
    return this.powerPanels.get(panelId);
  }

  getTotalCircuits(): number {
    return this.powerDistributions.reduce((sum, dist) => sum + dist.circuitAssignments.length, 0);
  }
}
