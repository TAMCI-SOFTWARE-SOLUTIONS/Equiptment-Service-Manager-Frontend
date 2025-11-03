import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {BrandsHeaderComponent} from '../brands-header/brands-header.component';
import {BrandsEmptyStateComponent} from '../brands-empty-state/brands-empty-state.component';
import {BrandsLoadingComponent} from '../brands-loading/brands-loading.component';
import {BrandsGroupListComponent} from '../brands-group-list/brands-group-list.component';
import {KeyboardShortcutsHelpComponent} from '../keyboard-shortcuts-help/keyboard-shortcuts-help.component';
import {SelectBrandTypeDrawerComponent} from '../select-brand-type-drawer/select-brand-type-drawer.component';
import {BrandsStore} from '../../model/brands.store';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    CommonModule,
    BrandsHeaderComponent,
    BrandsEmptyStateComponent,
    BrandsLoadingComponent,
    BrandsGroupListComponent,
    KeyboardShortcutsHelpComponent,
    SelectBrandTypeDrawerComponent,
    Toast
  ],
  providers: [BrandsStore, MessageService],
  templateUrl: './brands.page.html'
})
export class BrandsPage implements OnInit {
  readonly store = inject(BrandsStore);
  private readonly messageService = inject(MessageService);

  // UI State
  isDrawerVisible = false;
  isHelpVisible = false;

  ngOnInit(): void {
    this.store.loadBrands();

    // Listen to custom event from empty state
    document.addEventListener('create-brand', () => this.openDrawer());
  }

  // ==================== KEYBOARD SHORTCUTS ====================

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Ignorar si está escribiendo en un input/textarea
    const target = event.target as HTMLElement;
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes(target.tagName);

    // Ctrl/Cmd + K → Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]');
      searchInput?.focus();
      return;
    }

    // Ctrl/Cmd + R → Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.onRefresh();
      return;
    }

    // Ctrl/Cmd + N → New brand
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      this.openDrawer();
      return;
    }

    // ? → Show help (solo si NO está en input)
    if (event.key === '?' && !isInputFocused) {
      event.preventDefault();
      this.isHelpVisible = true;
      return;
    }

    // Esc → Clear search if focused
    if (event.key === 'Escape' && isInputFocused && this.store.searchQuery()) {
      event.preventDefault();
      this.onClearSearch();
      return;
    }
  }

  // ==================== HEADER ACTIONS ====================

  onSearchChange(query: string): void {
    this.store.setSearchQuery(query);
  }

  onClearSearch(): void {
    this.store.clearSearch();
  }

  onRefresh(): void {
    this.store.loadBrands();
    this.showToast('success', 'Datos actualizados', 'Las marcas y modelos se han recargado correctamente');
  }

  onShowHelp(): void {
    this.isHelpVisible = true;
  }

  // ==================== DRAWER ====================

  openDrawer(): void {
    this.isDrawerVisible = true;
  }

  async onBrandCreatedFromDrawer(event: { type: InspectableItemTypeEnum; name: string }): Promise<void> {
    const success = await this.store.createBrand(event.type, event.name);

    if (success) {
      // Cerrar drawer
      this.isDrawerVisible = false;

      // Mostrar toast
      this.showToast('success', 'Marca creada', `La marca "${event.name}" se ha creado correctamente`);

      // Expandir automáticamente el camino hasta la nueva marca
      const groupId = this.getGroupIdForType(event.type);
      if (groupId) {
        // Expandir grupo
        if (!this.store.isGroupExpanded()(groupId)) {
          this.store.toggleGroup(groupId);
        }

        // Expandir tipo
        if (!this.store.isTypeExpanded()(event.type)) {
          this.store.toggleType(event.type);
        }

        // Esperar un poco para que se renderice
        setTimeout(() => {
          // Buscar la marca recién creada y expandirla
          const brands = this.store.getBrandsByType()(event.type);
          const newBrand = brands.find(b => b.name === event.name);
          if (newBrand && !this.store.isBrandExpanded()(newBrand.id)) {
            this.store.toggleBrand(newBrand.id);
          }
        }, 200);
      }

    } else {
      // Mostrar error (el store ya manejó el error)
      const errorMsg = this.store.error() || 'Error al crear la marca';
      this.showToast('error', 'Error', errorMsg);
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

  // ==================== TOAST ====================

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000
    });
  }

  // ==================== GETTERS ====================

  get hasNoSearchResults(): boolean {
    return this.store.hasNoSearchResults();
  }
}
