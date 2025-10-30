import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsStore } from '../../model/brands.store';
import {InlineItemComponent, InlineItemConfig, SaveEvent} from '../inline-item/inline-item.component';
import {DescriptionEntity} from '../../../../entities/description/model/entities/description.entity';

@Component({
  selector: 'app-brands-description-item',
  standalone: true,
  imports: [CommonModule, InlineItemComponent],
  template: `
    <app-inline-item
      [config]="itemConfig"
      [isEditing]="isEditing"
      [editValue]="store.editDescriptionName()"
      (edit)="onStartEditingDescription()"
      (save)="onSaveDescription($event)"
      (cancel)="onCancelEditingDescription()"
      (editValueChange)="store.setEditDescriptionName($event)"
    />
  `
})
export class BrandsDescriptionItemComponent {
  @Input({ required: true }) brandId!: string;
  @Input({ required: true }) modelId!: string;
  @Input({ required: true }) description!: DescriptionEntity;

  readonly store = inject(BrandsStore);

  get itemConfig(): InlineItemConfig {
    return {
      id: this.description.id,
      name: this.description.name,
      type: 'description'
    };
  }

  get isEditing(): boolean {
    return this.store.editingDescriptionId() === this.description.id;
  }

  onStartEditingDescription(): void {
    this.store.startEditingDescription(this.description.id, this.description.name);
  }

  async onSaveDescription(event: SaveEvent): Promise<void> {
    await this.store.updateDescription(this.brandId, this.modelId, event.id, event.name);
  }

  onCancelEditingDescription(): void {
    this.store.cancelEditingDescription();
  }
}
