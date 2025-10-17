import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { CabinetEntity } from '../../../../entities/cabinet/model';
import { PanelEntity } from '../../../../entities/panel/model';
import { CabinetTypeEntity } from '../../../../entities/cabinet-type/model';
import { AreaEntity } from '../../../../entities/area/model';
import { Ripple } from 'primeng/ripple';
import { Drawer } from 'primeng/drawer';
import { MultiSelect } from 'primeng/multiselect';
import {CreateServiceStore} from '../../model/store/create-service.store';
import {PanelTypeEntity} from '../../../../entities/panel-type/model/panel-type.entity';

@Component({
  selector: 'app-step2-equipment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Ripple,
    Drawer,
    MultiSelect
  ],
  templateUrl: './step2-equipment.component.html'
})
export class Step2EquipmentComponent implements OnInit {
  readonly store = inject(CreateServiceStore);

  // Filters sidebar
  showFiltersSidebar = false;
  selectedAreas: AreaEntity[] = [];
  selectedCabinetTypes: CabinetTypeEntity[] = [];
  selectedPanelTypes: PanelTypeEntity[] = [];

  // Expose enum
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  ngOnInit(): void {
    // Cargar datos si no están cargados
    if (this.store.cabinets().length === 0 && this.store.panels().length === 0) {
      this.store.initialize();
    }
  }

  // ==================== EQUIPMENT SELECTION ====================

  selectCabinet(cabinet: CabinetEntity): void {
    this.store.selectEquipment(cabinet.id, EquipmentTypeEnum.CABINET);
  }

  selectPanel(panel: PanelEntity): void {
    this.store.selectEquipment(panel.id, EquipmentTypeEnum.PANEL);
  }

  isEquipmentSelected(equipmentId: string): boolean {
    return this.store.formData().selectedEquipmentId === equipmentId;
  }

  // ==================== SEARCH ====================

  onSearchChange(value: string): void {
    this.store.setSearchTerm(value);
  }

  clearSearch(): void {
    this.store.setSearchTerm('');
  }

  // ==================== FILTERS ====================

  openFilters(): void {
    this.showFiltersSidebar = true;
  }

  closeFilters(): void {
    this.showFiltersSidebar = false;
  }

  applyFilters(): void {
    this.store.setFilterByAreas(this.selectedAreas);

    if (this.store.showCabinets()) {
      this.store.setFilterByCabinetTypes(this.selectedCabinetTypes);
    }

    if (this.store.showPanels()) {
      this.store.setFilterByPanelTypes(this.selectedPanelTypes);
    }

    this.closeFilters();
  }

  clearFilters(): void {
    this.selectedAreas = [];
    this.selectedCabinetTypes = [];
    this.selectedPanelTypes = [];
    this.store.clearFilters();
  }
}
