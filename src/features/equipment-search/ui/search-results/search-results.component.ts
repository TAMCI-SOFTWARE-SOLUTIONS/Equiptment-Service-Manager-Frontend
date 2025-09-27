import {Component, inject} from '@angular/core';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {Divider} from 'primeng/divider';
import {NgClass} from '@angular/common';
import {EquipmentSearchStore} from '../../model';

@Component({
  selector: 'app-search-results',
  imports: [
    Divider,
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
}
