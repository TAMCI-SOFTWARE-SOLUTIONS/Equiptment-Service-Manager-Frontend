import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { PrimeTemplate } from 'primeng/api';
import {EquipmentInspectableItemsStore} from '../../model/equipment-inspectable-items.store';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';

interface TypeOption {
  label: string;
  value: InspectableItemTypeEnum;
  icon: string;
  color: string;
}

interface TypeGroupOption {
  label: string;
  icon: string;
  items: TypeOption[];
}

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

  async onModelChange(modelId: string | null): Promise<void> {
    await this.store.setModel(modelId);
  }

  // 🆕 Handler para Description
  onDescriptionChange(descriptionId: string | null): void {
    this.store.setDescription(descriptionId);
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

  getTypeOptions(): TypeGroupOption[] {
    const configs = this.store.typeConfigs();

    // Separar por grupo
    const componentTypes = configs
      .filter(c => c.group === 'component')
      .map(c => ({
        label: c.label,
        value: c.enum,
        icon: c.icon,
        color: c.color
      }));

    const equipmentTypes = configs
      .filter(c => c.group === 'equipment')
      .map(c => ({
        label: c.label,
        value: c.enum,
        icon: c.icon,
        color: c.color
      }));

    const otherTypes = configs
      .filter(c => c.group === 'other')
      .map(c => ({
        label: c.label,
        value: c.enum,
        icon: c.icon,
        color: c.color
      }));

    // Crear estructura de grupos
    const groups: TypeGroupOption[] = [];

    if (componentTypes.length > 0) {
      groups.push({
        label: 'Componentes',
        icon: ' pi-microchip',
        items: componentTypes
      });
    }

    if (equipmentTypes.length > 0) {
      groups.push({
        label: 'Dispositivos',
        icon: ' pi-bolt',
        items: equipmentTypes
      });
    }

    if (otherTypes.length > 0) {
      groups.push({
        label: 'Adicionales',
        icon: ' pi-ellipsis-h',
        items: otherTypes
      });
    }

    return groups;
  }

  getBrandOptions() {
    return this.store.availableBrands().map(brand => ({
      label: brand.name,
      value: brand.id
    }));
  }

  getSelectedTypeConfig() {
    const selectedType = this.store.formData().type;
    if (!selectedType) return null;

    return this.store.typeConfigs().find(c => c.enum === selectedType);
  }

  getModelOptions() {
    return this.store.availableModels().map(model => ({
      label: model.name,
      value: model.id
    }));
  }

  // 🆕 Options para Description
  getDescriptionOptions() {
    return this.store.availableDescriptions().map(description => ({
      label: description.name,
      value: description.id
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
