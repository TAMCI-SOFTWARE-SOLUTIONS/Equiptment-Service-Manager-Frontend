import {Component, inject} from '@angular/core';
import {DrawerModule} from 'primeng/drawer';
import {Button} from 'primeng/button';
import {EquipmentSearchStore} from '../../model';
import {MultiSelect} from 'primeng/multiselect';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';
import {FormsModule} from '@angular/forms';
import {AreaEntity} from '../../../../entities/area/model';

@Component({
  selector: 'app-filters-sidebar',
  imports: [
    DrawerModule,
    Button,
    MultiSelect,
    FormsModule
  ],
  templateUrl: './filters-sidebar.component.html',
  standalone: true,
  styleUrl: './filters-sidebar.component.css'
})
export class FiltersSidebarComponent {
  visible: boolean = false;
  readonly equipmentSearchStore = inject(EquipmentSearchStore);

  selectedCabinetTypes: CabinetTypeEntity[] = [];
  selectedAreas: AreaEntity[] = [];

  applyFilters() {
    this.equipmentSearchStore.setFilterByCabinetTypes(this.selectedCabinetTypes);
    this.equipmentSearchStore.setFilterByAreas(this.selectedAreas);
  }

  clearFilters() {
    this.selectedCabinetTypes = [];
    this.selectedAreas = [];
    this.equipmentSearchStore.cleanFilters();
  }
}
