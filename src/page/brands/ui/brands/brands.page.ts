import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrandsStore} from '../../model/brands.store';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {BrandEntity} from '../../../../entities/brand';
import {ModelEntity} from '../../../../entities/model';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {Ripple} from 'primeng/ripple';
import {SelectBrandTypeDrawerComponent} from '../select-brand-type-drawer/select-brand-type-drawer.component';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateComponent,
    Ripple,
    SelectBrandTypeDrawerComponent
  ],
  providers: [BrandsStore],
  templateUrl: './brands.page.html'
})
export class BrandsPage implements OnInit {
  readonly store = inject(BrandsStore);

  // Expose enum to template
  readonly InspectableItemTypeEnum = InspectableItemTypeEnum;

  // Drawer state
  isDrawerVisible = false;

  ngOnInit(): void {
    this.store.loadBrands();
  }

  // ==================== DRAWER ====================

  openDrawer(): void {
    this.isDrawerVisible = true;
  }

  async onBrandCreatedFromDrawer(event: { type: InspectableItemTypeEnum; name: string }): Promise<void> {
    const success = await this.store.createBrand(event.type, event.name);

    if (success) {
      const drawer = document.querySelector('app-select-brand-type-drawer') as any;
      drawer?.componentInstance?.resetAfterSuccess();

      const groupId = this.getGroupIdForType(event.type);
      if (groupId) {
        if (!this.store.isGroupExpanded()(groupId)) {
          this.onToggleGroup(groupId);
        }
        if (!this.store.isTypeExpanded()(event.type)) {
          this.onToggleType(event.type);
        }
      }

      setTimeout(() => {
        const brands = this.store.getBrandsByType()(event.type);
        const newBrand = brands.find(b => b.name === event.name);
        if (newBrand) {
          this.onToggleBrand(newBrand.id);
        }
      }, 200);

    } else {
      // Notificar al drawer que hubo error
      const drawer = document.querySelector('app-select-brand-type-drawer') as any;
      drawer?.componentInstance?.resetAfterError();
    }
  }

  private getGroupIdForType(type: InspectableItemTypeEnum): string | null {
    const typeToGroup: Record<InspectableItemTypeEnum, string> = {
      [InspectableItemTypeEnum.COMMUNICATION]: 'COMPONENTES',
      [InspectableItemTypeEnum.STATE]: 'COMPONENTES',
      [InspectableItemTypeEnum.POWER_SUPPLY]: 'DISPOSITIVOS',
      [InspectableItemTypeEnum.POWER_120VAC]: 'DISPOSITIVOS',
      [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: 'ADICIONALES',
      [InspectableItemTypeEnum.OTHERS]: 'ADICIONALES'
    };
    return typeToGroup[type] ?? null;
  }

  // ==================== SEARCH ====================

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

  // ==================== ACCORDION ====================

  onToggleGroup(groupId: string): void {
    this.store.toggleGroup(groupId);
  }

  onToggleType(typeEnum: InspectableItemTypeEnum): void {
    this.store.toggleType(typeEnum);
  }

  async onToggleBrand(brandId: string): Promise<void> {
    await this.store.toggleBrand(brandId);
  }

  // ==================== BRAND CRUD ====================

  onStartCreatingBrand(type: InspectableItemTypeEnum): void {
    this.store.startCreatingBrand(type);
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        `#new-brand-input-${type}`
      );
      input?.focus();
    }, 100);
  }

  onCancelCreatingBrand(): void {
    this.store.cancelCreatingBrand();
  }

  async onSaveNewBrand(type: InspectableItemTypeEnum): Promise<void> {
    const name = this.store.newBrandName().trim();
    if (!name || name.length < 2) return;

    const success = await this.store.createBrand(type, name);
    if (success) {
      // Expandir el tipo para ver la nueva marca
      this.store.toggleType(type);
    }
  }

  onStartEditingBrand(brand: BrandEntity): void {
    this.store.startEditingBrand(brand.id, brand.name);
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        `#edit-brand-input-${brand.id}`
      );
      input?.focus();
      input?.select();
    }, 100);
  }

  onCancelEditingBrand(): void {
    this.store.cancelEditingBrand();
  }

  async onSaveEditBrand(brandId: string): Promise<void> {
    const name = this.store.editBrandName().trim();
    if (!name || name.length < 2) return;

    await this.store.updateBrand(brandId, name);
  }

  onKeyDownBrand(event: KeyboardEvent, action: 'create' | 'edit', typeOrId: any): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (action === 'create') {
        this.onSaveNewBrand(typeOrId as InspectableItemTypeEnum).then();
      } else {
        this.onSaveEditBrand(typeOrId as string).then();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (action === 'create') {
        this.onCancelCreatingBrand();
      } else {
        this.onCancelEditingBrand();
      }
    }
  }

  // ==================== MODEL CRUD ====================

  onStartCreatingModel(brandId: string): void {
    this.store.startCreatingModel(brandId);
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        `#new-model-input-${brandId}`
      );
      input?.focus();
    }, 100);
  }

  onCancelCreatingModel(): void {
    this.store.cancelCreatingModel();
  }

  async onSaveNewModel(brandId: string): Promise<void> {
    const name = this.store.newModelName().trim();
    if (!name || name.length < 2) return;

    await this.store.createModel(brandId, name);
  }

  onStartEditingModel(model: ModelEntity): void {
    this.store.startEditingModel(model.id, model.name);
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        `#edit-model-input-${model.id}`
      );
      input?.focus();
      input?.select();
    }, 100);
  }

  onCancelEditingModel(): void {
    this.store.cancelEditingModel();
  }

  async onSaveEditModel(brandId: string, modelId: string): Promise<void> {
    const name = this.store.editModelName().trim();
    if (!name || name.length < 2) return;

    await this.store.updateModel(brandId, modelId, name);
  }

  onKeyDownModel(
    event: KeyboardEvent,
    action: 'create' | 'edit',
    brandId: string,
    modelId?: string
  ): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (action === 'create') {
        this.onSaveNewModel(brandId);
      } else {
        this.onSaveEditModel(brandId, modelId!);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (action === 'create') {
        this.onCancelCreatingModel();
      } else {
        this.onCancelEditingModel();
      }
    }
  }

  // ==================== HELPERS ====================

  isCreatingBrandForType(type: InspectableItemTypeEnum): boolean {
    return this.store.creatingBrandForType() === type;
  }

  isEditingBrand(brandId: string): boolean {
    return this.store.editingBrandId() === brandId;
  }

  isCreatingModelForBrand(brandId: string): boolean {
    return this.store.creatingModelForBrandId() === brandId;
  }

  isEditingModel(modelId: string): boolean {
    return this.store.editingModelId() === modelId;
  }

  onRefresh(): void {
    this.store.loadBrands();
  }

  getColorClasses(color: string): { bg: string; text: string; border: string } {
    if (color === 'cyan') {
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        border: 'border-cyan-300'
      };
    }

    // Default: Sky
    return {
      bg: 'bg-sky-100',
      text: 'text-sky-700',
      border: 'border-sky-300'
    };
  }
}
