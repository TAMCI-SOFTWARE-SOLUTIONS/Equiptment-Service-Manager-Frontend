import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsStore } from '../../model/brands.store';
import { BrandEntity } from '../../../../entities/brand';
import {ExpandableItemComponent, ExpandableItemConfig} from '../expandable-item/expandable-item.component';
import {BrandsModelListComponent} from '../brands-model-list/brands-model-list.component';
import {SaveEvent} from '../inline-item/inline-item.component';

@Component({
  selector: 'app-brands-brand-item',
  standalone: true,
  imports: [CommonModule, ExpandableItemComponent, BrandsModelListComponent],
  template: `
    <app-expandable-item
      [config]="itemConfig"
      [isExpanded]="isExpanded"
      [isEditing]="isEditing"
      [isLoading]="isLoadingModels"
      [editValue]="store.editBrandName()"
      (toggle)="onToggleBrand()"
      (edit)="onStartEditingBrand()"
      (save)="onSaveBrand($event)"
      (cancel)="onCancelEditingBrand()"
      (editValueChange)="store.setEditBrandName($event)"
    >
      <!-- Children: Model List -->
      <app-brands-model-list [brandId]="brand.id" />
    </app-expandable-item>
  `
})
export class BrandsBrandItemComponent {
  @Input({ required: true }) brand!: BrandEntity;

  readonly store = inject(BrandsStore);

  get itemConfig(): ExpandableItemConfig {
    return {
      id: this.brand.id,
      name: this.brand.name,
      icon: 'pi-tag',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
      badge: `${this.brand.totalModels}`,
      type: 'brand'
    };
  }

  get isExpanded(): boolean {
    return this.store.isBrandExpanded()(this.brand.id);
  }

  get isEditing(): boolean {
    return this.store.editingBrandId() === this.brand.id;
  }

  get isLoadingModels(): boolean {
    return (this.brand as any).isLoadingModels || false;
  }

  async onToggleBrand(): Promise<void> {
    await this.store.toggleBrand(this.brand.id);
  }

  onStartEditingBrand(): void {
    this.store.startEditingBrand(this.brand.id, this.brand.name);
  }

  async onSaveBrand(event: SaveEvent): Promise<void> {
    await this.store.updateBrand(event.id, event.name);
  }

  onCancelEditingBrand(): void {
    this.store.cancelEditingBrand();
  }
}
