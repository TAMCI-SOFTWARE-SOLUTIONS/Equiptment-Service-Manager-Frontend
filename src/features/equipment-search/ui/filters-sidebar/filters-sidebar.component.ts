import {Component, inject} from '@angular/core';
import {DrawerModule} from 'primeng/drawer';
import {Button} from 'primeng/button';
import {EquipmentSearchStore} from '../../model';
import {MultiSelect} from 'primeng/multiselect';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';
import {FormsModule} from '@angular/forms';

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

  applyFilters() {
    this.equipmentSearchStore.setFilterByCabinetTypes(this.selectedCabinetTypes);
  }

  clearFilters() {
    this.selectedCabinetTypes = [];
    this.equipmentSearchStore.cleanFilters();
  }
}
