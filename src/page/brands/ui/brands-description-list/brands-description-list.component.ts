import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { BrandsStore } from '../../model/brands.store';
import {BrandsDescriptionItemComponent} from '../brands-description-item/brands-description-item.component';

@Component({
  selector: 'app-brands-description-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, BrandsDescriptionItemComponent],
  templateUrl: './brands-description-list.component.html'
})
export class BrandsDescriptionListComponent {
  @Input({ required: true }) brandId!: string;
  @Input({ required: true }) modelId!: string;

  readonly store = inject(BrandsStore);

  onStartCreatingDescription(): void {
    this.store.startCreatingDescription(this.modelId);
    setTimeout(() => {
      document.querySelector<HTMLInputElement>(`#new-description-input-${this.modelId}`)?.focus();
    }, 100);
  }

  async onSaveNewDescription(): Promise<void> {
    const name = this.store.newDescriptionName().trim();
    if (!name || name.length < 2 || name.length > 50) return;
    await this.store.createDescription(this.brandId, this.modelId, name);
  }

  onCancelCreatingDescription(): void {
    this.store.cancelCreatingDescription();
  }

  get descriptions() {
    const model = this.store.getModelById()(this.modelId);
    return model?.descriptions || [];
  }

  get isCreatingDescription(): boolean {
    return this.store.creatingDescriptionForModelId() === this.modelId;
  }
}
