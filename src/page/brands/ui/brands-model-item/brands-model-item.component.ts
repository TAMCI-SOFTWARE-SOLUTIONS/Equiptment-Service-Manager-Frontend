import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsStore } from '../../model/brands.store';
import { ModelEntity } from '../../../../entities/model';
import {ExpandableItemComponent, ExpandableItemConfig} from '../expandable-item/expandable-item.component';
import {BrandsDescriptionListComponent} from '../brands-description-list/brands-description-list.component';
import {SaveEvent} from '../inline-item/inline-item.component';

@Component({
  selector: 'app-brands-model-item',
  standalone: true,
  imports: [CommonModule, ExpandableItemComponent, BrandsDescriptionListComponent],
  template: `
    <app-expandable-item
      [config]="itemConfig"
      [isExpanded]="isExpanded"
      [isEditing]="isEditing"
      [isLoading]="isLoadingDescriptions"
      [editValue]="store.editModelName()"
      (toggle)="onToggleModel()"
      (edit)="onStartEditingModel()"
      (save)="onSaveModel($event)"
      (cancel)="onCancelEditingModel()"
      (editValueChange)="store.setEditModelName($event)"
    >
      <!-- Children: Description List -->
      <app-brands-description-list [brandId]="brandId" [modelId]="model.id" />
    </app-expandable-item>
  `
})
export class BrandsModelItemComponent {
  @Input({ required: true }) brandId!: string;
  @Input({ required: true }) model!: ModelEntity;

  readonly store = inject(BrandsStore);

  get itemConfig(): ExpandableItemConfig {
    return {
      id: this.model.id,
      name: this.model.name,
      icon: 'pi-cog',
      iconColor: 'text-cyan-600',
      badge: `${this.model.totalDescriptions} descripción${this.model.totalDescriptions !== 1 ? 'es' : ''}`,
      type: 'model'
    };
  }

  get isExpanded(): boolean {
    return this.store.isModelExpanded()(this.model.id);
  }

  get isEditing(): boolean {
    return this.store.editingModelId() === this.model.id;
  }

  get isLoadingDescriptions(): boolean {
    return (this.model as any).isLoadingDescriptions || false;
  }

  async onToggleModel(): Promise<void> {
    await this.store.toggleModel(this.brandId, this.model.id);
  }

  onStartEditingModel(): void {
    this.store.startEditingModel(this.model.id, this.model.name);
  }

  async onSaveModel(event: SaveEvent): Promise<void> {
    await this.store.updateModel(this.brandId, event.id, event.name);
  }

  onCancelEditingModel(): void {
    this.store.cancelEditingModel();
  }
}
