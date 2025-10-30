import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrandsStore} from '../../model/brands.store';
import {BrandsTypeItemComponent} from '../brands-type-item/brands-type-item.component';

@Component({
  selector: 'app-brands-group-list',
  standalone: true,
  imports: [CommonModule, BrandsTypeItemComponent],
  template: `
    <div class="space-y-6">
      @for (group of store.groups(); track group.id) {
        <div>
          <!-- Group Header (Static - No expandible) -->
          <div class="mb-3 flex items-center gap-2 px-1">
            <i [class]="'pi ' + group.icon + ' text-xs text-gray-400'"></i>
            <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {{ group.label }}
            </h2>
          </div>

          <!-- Types -->
          <div class="space-y-2">
            @for (type of group.types; track type.enum) {
              <app-brands-type-item [type]="type" />
            }
          </div>
        </div>
      }
    </div>
  `
})
export class BrandsGroupListComponent {
  readonly store = inject(BrandsStore);
}
