import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import {BrandsStore} from '../../model/brands.store';
import {BrandsTypeItemComponent} from '../brands-type-item/brands-type-item.component';

interface GroupConfig {
  id: string;
  label: string;
  icon: string;
  types: any[];
}

@Component({
  selector: 'app-brands-group-item',
  standalone: true,
  imports: [CommonModule, Ripple, BrandsTypeItemComponent, BrandsTypeItemComponent],
  templateUrl: './brands-group-item.component.html'
})
export class BrandsGroupItemComponent {
  @Input({ required: true }) group!: GroupConfig;

  readonly store = inject(BrandsStore);

  onToggleGroup(): void {
    this.store.toggleGroup(this.group.id);
  }

  get isExpanded(): boolean {
    return this.store.isGroupExpanded()(this.group.id);
  }
}
