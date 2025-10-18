import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentsStore } from '../../model/equipments.store';
import { EquipmentStatusEnum, getEquipmentStatusLabel } from '../../../../entities/equipment/model/equipment-status.enum';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-equipment-filters-aside',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  template: `
    <!-- Overlay -->
    @if (show) {
      <div
        class="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
        (click)="onClose.emit()"
        [@fadeIn]>
      </div>
    }

    <!-- Aside Panel -->
    <aside
      class="fixed bottom-0 right-0 top-0 z-50 flex w-80 max-w-full flex-col bg-white shadow-xl transition-transform lg:hidden"
      [class.translate-x-0]="show"
      [class.translate-x-full]="!show"
      [@slideIn]>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 class="text-lg font-semibold text-gray-900">Filtros</h2>

        <div class="flex items-center gap-2">
          @if (store.hasActiveFilters()) {
            <button
              pRipple
              type="button"
              (click)="onClearFilters()"
              class="text-sm font-medium text-sky-600 hover:text-sky-700">
              Limpiar todo
            </button>
          }

          <button
            pRipple
            type="button"
            (click)="onClose.emit()"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100">
            <i class="pi pi-times text-base"></i>
          </button>
        </div>
      </div>

      <!-- Filters Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-6">

          <!-- Plant Filter -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Planta
            </label>
            <select
              [value]="store.filters().plantId || ''"
              (change)="onPlantChange($any($event.target).value)"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="">Todas las plantas</option>
              @for (plant of store.uniquePlants(); track plant.id) {
                <option [value]="plant.id">{{ plant.name }}</option>
              }
            </select>
            @if (store.filters().plantId) {
              <p class="mt-1.5 text-xs text-sky-600">
                <i class="pi pi-filter text-xs"></i>
                Filtro aplicado
              </p>
            }
          </div>

          <!-- Status Filter -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              [value]="store.filters().statusFilter || ''"
              (change)="onStatusChange($any($event.target).value)"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="">Todos los estados</option>
              <option [value]="EquipmentStatusEnum.OPERATIVE">
                {{ getEquipmentStatusLabel(EquipmentStatusEnum.OPERATIVE) }}
              </option>
              <option [value]="EquipmentStatusEnum.STAND_BY">
                {{ getEquipmentStatusLabel(EquipmentStatusEnum.STAND_BY) }}
              </option>
              <option [value]="EquipmentStatusEnum.INOPERATIVE">
                {{ getEquipmentStatusLabel(EquipmentStatusEnum.INOPERATIVE) }}
              </option>
              <option [value]="EquipmentStatusEnum.RETIRED">
                {{ getEquipmentStatusLabel(EquipmentStatusEnum.RETIRED) }}
              </option>
            </select>
            @if (store.filters().statusFilter) {
              <p class="mt-1.5 text-xs text-sky-600">
                <i class="pi pi-filter text-xs"></i>
                Filtro aplicado
              </p>
            }
          </div>

          <!-- Active Filters Summary -->
          @if (store.hasActiveFilters()) {
            <div class="rounded-lg border border-sky-200 bg-sky-50 p-3">
              <p class="mb-2 text-xs font-semibold text-sky-900">
                Filtros activos
              </p>
              <div class="space-y-1">
                @if (store.filters().typeFilter !== 'all') {
                  <p class="text-xs text-sky-700">
                    • Tipo: {{ store.filters().typeFilter === 'cabinet' ? 'Gabinetes' : 'Paneles' }}
                  </p>
                }
                @if (store.filters().plantId) {
                  <p class="text-xs text-sky-700">
                    • Planta seleccionada
                  </p>
                }
                @if (store.filters().statusFilter) {
                  <p class="text-xs text-sky-700">
                    • Estado: {{ getEquipmentStatusLabel(store.filters().statusFilter!) }}
                  </p>
                }
                @if (store.filters().searchQuery) {
                  <p class="text-xs text-sky-700">
                    • Búsqueda: "{{ store.filters().searchQuery }}"
                  </p>
                }
              </div>
            </div>
          }

        </div>
      </div>

      <!-- Footer Actions -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex gap-3">
          <button
            pRipple
            type="button"
            (click)="onClose.emit()"
            class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50">
            Cancelar
          </button>

          <button
            pRipple
            type="button"
            (click)="onApplyFilters()"
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/40">
            <i class="pi pi-check text-sm"></i>
            Aplicar
          </button>
        </div>
      </div>

    </aside>
  `,
  animations: [
    // Puedes agregar animaciones si quieres, o usar solo CSS transitions
  ]
})
export class EquipmentFiltersAsideComponent {
  readonly store = inject(EquipmentsStore);

  @Input() show = false;
  @Output() onClose = new EventEmitter<void>();

  // Expose enum to template
  readonly EquipmentStatusEnum = EquipmentStatusEnum;

  onPlantChange(value: string): void {
    this.store.setPlantFilter(value || null);
  }

  onStatusChange(value: string): void {
    this.store.setStatusFilter(value as EquipmentStatusEnum || null);
  }

  onClearFilters(): void {
    this.store.clearFilters();
  }

  onApplyFilters(): void {
    this.onClose.emit();
  }

  getEquipmentStatusLabel = getEquipmentStatusLabel;
}
