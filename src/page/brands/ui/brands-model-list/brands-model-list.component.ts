import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { BrandsStore } from '../../model/brands.store';
import {BrandsModelItemComponent} from '../brands-model-item/brands-model-item.component';

@Component({
  selector: 'app-brands-model-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, BrandsModelItemComponent],
  templateUrl: './brands-model-list.component.html'
})
export class BrandsModelListComponent {
  @Input({ required: true }) brandId!: string;

  readonly store = inject(BrandsStore);

  onStartCreatingModel(): void {
    this.store.startCreatingModel(this.brandId);
    setTimeout(() => {
      document.querySelector<HTMLInputElement>(`#new-model-input-${this.brandId}`)?.focus();
    }, 100);
  }

  async onSaveNewModel(): Promise<void> {
    const name = this.store.newModelName().trim();
    if (!name || name.length < 2 || name.length > 50) return;
    await this.store.createModel(this.brandId, name);
  }

  onCancelCreatingModel(): void {
    this.store.cancelCreatingModel();
  }

  get models() {
    const brand = this.store.getBrandById()(this.brandId);
    return brand?.models || [];
  }

  get isCreatingModel(): boolean {
    return this.store.creatingModelForBrandId() === this.brandId;
  }
}
