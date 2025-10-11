import {Component, inject} from '@angular/core';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {NgClass} from '@angular/common';
import {EquipmentSearchStore} from '../../model';
import {PanelEntity} from '../../../../entities/panel/model';

@Component({
  selector: 'app-search-results',
  imports: [
    NgClass
  ],
  templateUrl: './search-results.component.html',
  standalone: true,
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent {
  readonly equipmentSearchStore = inject(EquipmentSearchStore);

  onSelectCabinet(cabinet: CabinetEntity) {
    this.equipmentSearchStore.setSelectedCabinet(cabinet);
  }

  onSelectPanel(panel: PanelEntity) {
    this.equipmentSearchStore.setSelectedPanel(panel);
  }
}
