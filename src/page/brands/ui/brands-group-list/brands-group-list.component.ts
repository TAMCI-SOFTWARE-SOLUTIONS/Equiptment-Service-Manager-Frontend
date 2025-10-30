import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrandsStore} from '../../model/brands.store';
import {BrandsGroupItemComponent} from '../brands-group-item/brands-group-item.component';

@Component({
  selector: 'app-brands-group-list',
  standalone: true,
  imports: [CommonModule, BrandsGroupItemComponent],
  template: `
    <div class="space-y-4">
      @for (group of store.groups(); track group.id) {
        <app-brands-group-item [group]="group" />
      }
    </div>
  `
})
export class BrandsGroupListComponent {
  readonly store = inject(BrandsStore);
}
