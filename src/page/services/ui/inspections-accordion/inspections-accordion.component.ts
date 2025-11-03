import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InspectionFiltersComponent, FilterType } from '../inspection-filters/inspection-filters.component';
import { InspectionCategoryGroupComponent } from '../inspection-category-group/inspection-category-group.component';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemInspectionWithComparison} from '../../model/interfaces/item-inspection-with-comparison.interface';

interface CategoryConfig {
  type: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    type: InspectableItemTypeEnum.COMMUNICATION,
    label: 'Comunicación',
    icon: 'pi-wifi',
    color: 'sky'
  },
  {
    type: InspectableItemTypeEnum.POWER_SUPPLY,
    label: 'Fuentes de Poder',
    icon: 'pi-bolt',
    color: 'amber'
  },
  {
    type: InspectableItemTypeEnum.POWER_120VAC,
    label: 'Alimentación 120 VAC',
    icon: 'pi-flash',
    color: 'yellow'
  },
  {
    type: InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
    label: 'Orden y Limpieza',
    icon: 'pi-check-square',
    color: 'green'
  },
  {
    type: InspectableItemTypeEnum.OTHERS,
    label: 'Otros',
    icon: 'pi-ellipsis-h',
    color: 'gray'
  }
];

@Component({
  selector: 'app-inspections-accordion',
  standalone: true,
  imports: [
    CommonModule,
    InspectionFiltersComponent,
    InspectionCategoryGroupComponent
  ],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
            <i class="pi pi-list-check text-2xl text-sky-600"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Inspecciones</h2>
            <p class="text-sm text-gray-600">
              {{ totalItems() }} item(s) • {{ totalChanges() }} cambio(s)
            </p>
          </div>
        </div>

        <!-- Expand/Collapse All -->
        <button
          (click)="onToggleAll.emit()"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50">
          <i class="pi" [class.pi-angle-double-down]="!allOpen()" [class.pi-angle-double-up]="allOpen()"></i>
          <span>{{ allOpen() ? 'Cerrar' : 'Expandir' }} todo</span>
        </button>
      </div>

      <!-- Filters -->
      <app-inspection-filters
        [currentFilter]="currentFilter()"
        [totalItems]="totalItems()"
        [totalChanges]="totalChanges()"
        (onFilterChange)="onFilterChange.emit($event)">
      </app-inspection-filters>

      <!-- Empty State (if filtered and no results) -->
      @if (filteredItems().length === 0) {
        <div class="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <i class="pi pi-filter-slash text-5xl text-gray-300"></i>
          <p class="mt-4 text-lg font-semibold text-gray-900">No hay items para mostrar</p>
          <p class="mt-1 text-sm text-gray-600">
            @if (currentFilter() === 'changes-only') {
              No se detectaron cambios en este servicio
            } @else {
              Intenta ajustando los filtros
            }
          </p>
        </div>
      } @else {
        <!-- Categories -->
        <div class="space-y-4">
          @for (config of visibleCategories(); track config.type) {
            <app-inspection-category-group
              [category]="config.type"
              [categoryLabel]="config.label"
              [categoryIcon]="config.icon"
              [categoryColor]="config.color"
              [items]="getCategoryItems(config.type)"
              [isOpen]="isCategoryOpen(config.type)"
              (onToggle)="onCategoryToggle.emit(config.type)">
            </app-inspection-category-group>
          }
        </div>
      }

    </div>
  `
})
export class InspectionsAccordionComponent {
  readonly allItems = input.required<ItemInspectionWithComparison[]>();
  readonly filteredItems = input.required<ItemInspectionWithComparison[]>();
  readonly itemsByCategory = input.required<Map<InspectableItemTypeEnum, ItemInspectionWithComparison[]>>();
  readonly currentFilter = input.required<FilterType>();
  readonly openCategories = input.required<Set<InspectableItemTypeEnum>>();

  readonly onFilterChange = output<FilterType>();
  readonly onCategoryToggle = output<InspectableItemTypeEnum>();
  readonly onToggleAll = output<void>();

  readonly totalItems = computed(() => this.allItems().length);
  readonly totalChanges = computed(() => this.allItems().filter(i => i.hasChanges).length);

  readonly visibleCategories = computed(() => {
    // Filtrar solo categorías que tienen items
    return CATEGORY_CONFIGS.filter(config => {
      const items = this.getCategoryItems(config.type);
      return items.length > 0;
    });
  });

  readonly allOpen = computed(() => {
    const visible = this.visibleCategories();
    const open = this.openCategories();
    return visible.every(config => open.has(config.type));
  });

  getCategoryItems(type: InspectableItemTypeEnum): ItemInspectionWithComparison[] {
    return this.itemsByCategory().get(type) || [];
  }

  isCategoryOpen(type: InspectableItemTypeEnum): boolean {
    return this.openCategories().has(type);
  }
}
