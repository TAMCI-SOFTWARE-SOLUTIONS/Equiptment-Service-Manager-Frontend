import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemInspectionWithComparison} from '../../model/interfaces/item-inspection-with-comparison.interface';
import {InspectionItemComparisonComponent} from '../inspection-item-comparison/inspection-item-comparison.component';

@Component({
  selector: 'app-inspection-category-group',
  standalone: true,
  imports: [
    CommonModule,
    InspectionItemComparisonComponent,
  ],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white">

      <!-- Accordion Header -->
      <button
        (click)="onToggle.emit()"
        class="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-gray-50">

        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
               [class]="'bg-' + categoryColor() + '-100'">
            <i [class]="'pi text-lg ' + categoryIcon() + ' text-' + categoryColor() + '-600'"></i>
          </div>

          <!-- Label and counts -->
          <div>
            <p class="font-semibold text-gray-900">{{ categoryLabel() }}</p>
            <div class="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
              <span>{{ items().length }} item(s)</span>
              @if (changesCount() > 0) {
                <span class="text-gray-400">•</span>
                <span class="font-semibold text-sky-600">{{ changesCount() }} cambio(s)</span>
              }
            </div>
          </div>
        </div>

        <!-- Chevron -->
        <i class="pi text-gray-400 transition-transform duration-200"
           [class.pi-chevron-down]="!isOpen()"
           [class.pi-chevron-up]="isOpen()"
           [class.rotate-180]="isOpen()"></i>
      </button>

      <!-- Accordion Content -->
      @if (isOpen()) {
        <div class="border-t border-gray-200 p-5">
          @if (items().length > 0) {
            <div class="space-y-3">
              @for (item of items(); track item.id) {
                <app-inspection-item-comparison [item]="item" />
              }
            </div>
          } @else {
            <div class="py-8 text-center">
              <i class="pi pi-inbox text-4xl text-gray-300"></i>
              <p class="mt-2 text-sm text-gray-500">No hay items en esta categoría</p>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class InspectionCategoryGroupComponent {
  readonly category = input.required<InspectableItemTypeEnum>();
  readonly categoryLabel = input.required<string>();
  readonly categoryIcon = input.required<string>();
  readonly categoryColor = input.required<string>();
  readonly items = input.required<ItemInspectionWithComparison[]>();
  readonly isOpen = input.required<boolean>();

  readonly onToggle = output<void>();

  changesCount(): number {
    return this.items().filter(i => i.hasChanges).length;
  }
}
