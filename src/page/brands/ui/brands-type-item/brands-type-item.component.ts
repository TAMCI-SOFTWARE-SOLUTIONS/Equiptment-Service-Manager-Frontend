import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {BrandsStore} from '../../model/brands.store';
import {BrandsBrandItemComponent} from '../brands-brand-item/brands-brand-item.component';

interface TypeConfig {
  enum: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-brands-type-item',
  standalone: true,
  imports: [CommonModule, Ripple, BrandsBrandItemComponent],
  templateUrl: './brands-type-item.component.html'
})
export class BrandsTypeItemComponent {
  @Input({ required: true }) type!: TypeConfig;

  readonly store = inject(BrandsStore);

  onToggleType(): void {
    this.store.toggleType(this.type.enum);
  }

  onStartCreatingBrand(): void {
    this.store.startCreatingBrand(this.type.enum);

    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        `#new-brand-input-${this.type.enum}`
      );
      input?.focus();
    }, 100);
  }

  get isExpanded(): boolean {
    return this.store.isTypeExpanded()(this.type.enum);
  }

  get brandsCount(): number {
    return this.store.getBrandsCountByType()(this.type.enum);
  }

  get brands() {
    return this.store.getBrandsByType()(this.type.enum);
  }

  get isCreatingBrand(): boolean {
    return this.store.creatingBrandForType() === this.type.enum;
  }

  getColorClasses() {
    if (this.type.color === 'cyan') {
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        border: 'border-cyan-300',
        hover: 'hover:bg-cyan-50'
      };
    }

    return {
      bg: 'bg-sky-100',
      text: 'text-sky-700',
      border: 'border-sky-300',
      hover: 'hover:bg-sky-50'
    };
  }

  // Agregar estos métodos al BrandsTypeItemComponent:

  async onSaveNewBrand(): Promise<void> {
    const name = this.store.newBrandName().trim();
    if (!name || name.length < 2 || name.length > 50) return;

    const success = await this.store.createBrand(this.type.enum, name);
    if (success) {
      // Ya se expandió automáticamente en el store
      console.log('✅ Brand created successfully');
    }
  }

  onCancelCreatingBrand(): void {
    this.store.cancelCreatingBrand();
  }
}
