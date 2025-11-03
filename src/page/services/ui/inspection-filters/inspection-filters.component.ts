import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FilterType = 'all' | 'changes-only';

@Component({
  selector: 'app-inspection-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap items-center gap-3">

      <!-- Label -->
      <span class="text-sm font-medium text-gray-700">Mostrar:</span>

      <!-- All Button -->
      <button
        (click)="onFilterChange.emit('all')"
        class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
        [class.bg-sky-500]="currentFilter() === 'all'"
        [class.text-white]="currentFilter() === 'all'"
        [class.shadow-lg]="currentFilter() === 'all'"
        [class.bg-white]="currentFilter() !== 'all'"
        [class.text-gray-700]="currentFilter() !== 'all'"
        [class.border]="currentFilter() !== 'all'"
        [class.border-gray-200]="currentFilter() !== 'all'"
        [class.hover:bg-gray-50]="currentFilter() !== 'all'">
        <i class="pi pi-list"></i>
        <span>Todos</span>
        <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold"
              [class.text-white]="currentFilter() === 'all'"
              [class.text-gray-600]="currentFilter() !== 'all'"
              [class.bg-gray-100]="currentFilter() !== 'all'">
          {{ totalItems() }}
        </span>
      </button>

      <!-- Changes Only Button -->
      <button
        (click)="onFilterChange.emit('changes-only')"
        class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
        [class.bg-sky-500]="currentFilter() === 'changes-only'"
        [class.text-white]="currentFilter() === 'changes-only'"
        [class.shadow-lg]="currentFilter() === 'changes-only'"
        [class.bg-white]="currentFilter() !== 'changes-only'"
        [class.text-gray-700]="currentFilter() !== 'changes-only'"
        [class.border]="currentFilter() !== 'changes-only'"
        [class.border-gray-200]="currentFilter() !== 'changes-only'"
        [class.hover:bg-gray-50]="currentFilter() !== 'changes-only'">
        <i class="pi pi-sync"></i>
        <span>Solo Cambios</span>
        @if (totalChanges() > 0) {
          <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold"
                [class.text-white]="currentFilter() === 'changes-only'"
                [class.text-gray-600]="currentFilter() !== 'changes-only'"
                [class.bg-gray-100]="currentFilter() !== 'changes-only'">
            {{ totalChanges() }}
          </span>
        }
      </button>

    </div>
  `
})
export class InspectionFiltersComponent {
  readonly currentFilter = input.required<FilterType>();
  readonly totalItems = input.required<number>();
  readonly totalChanges = input.required<number>();

  readonly onFilterChange = output<FilterType>();
}
