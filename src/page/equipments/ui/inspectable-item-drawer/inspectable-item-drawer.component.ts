import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { PrimeTemplate } from 'primeng/api';
import {EquipmentInspectableItemsStore} from '../../model/equipment-inspectable-items.store';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';

@Component({
  selector: 'app-inspectable-item-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Drawer,
    Ripple,
    Select,
    PrimeTemplate
  ],
  templateUrl: './inspectable-item-drawer.component.html'
})
export class InspectableItemDrawerComponent {
  readonly store = inject(EquipmentInspectableItemsStore);

  @Output() onSuccess = new EventEmitter<void>();

  // Expose enum to template
  readonly InspectableItemTypeEnum = InspectableItemTypeEnum;

  // ==================== FORM HANDLERS ====================

  onTagChange(value: string): void {
    this.store.setTag(value);
  }

  async onTypeChange(type: InspectableItemTypeEnum | null): Promise<void> {
    await this.store.setType(type);
  }

  async onBrandChange(brandId: string | null): Promise<void> {
    await this.store.setBrand(brandId);
  }

  onModelChange(modelId: string | null): void {
    this.store.setModel(modelId);
  }

  onDescripcionChange(value: string): void {
    this.store.setDescripcion(value);
  }

  // ==================== DRAWER ACTIONS ====================

  onClose(): void {
    this.store.closeDrawer();
  }

  async onSubmit(): Promise<void> {
    const isEdit = this.store.drawerMode() === 'edit';

    let success: boolean;
    if (isEdit) {
      success = await this.store.updateItem();
    } else {
      success = await this.store.createItem();
    }

    if (success) {
      this.onSuccess.emit();
    }
  }

  // ==================== HELPERS ====================

  getTypeOptions() {
    return this.store.typeConfigs().map(config => ({
      label: config.label,
      value: config.enum,
      icon: config.icon,
      color: config.color
    }));
  }

  getBrandOptions() {
    return this.store.availableBrands().map(brand => ({
      label: brand.name,
      value: brand.id
    }));
  }

  getModelOptions() {
    return this.store.availableModels().map(model => ({
      label: model.name,
      value: model.id
    }));
  }

  getColorClasses(color: string): { bg: string; text: string } {
    if (color === 'cyan') {
      return { bg: 'bg-cyan-100', text: 'text-cyan-700' };
    }
    // Default: Sky
    return { bg: 'bg-sky-100', text: 'text-sky-700' };
  }
}
