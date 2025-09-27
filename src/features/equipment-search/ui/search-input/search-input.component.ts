import {Component, inject} from '@angular/core';
import {InputIcon, InputIconModule} from 'primeng/inputicon';
import {IconField, IconFieldModule} from 'primeng/iconfield';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {EquipmentSearchStore} from '../../model/equipment-search.store';

@Component({
  selector: 'app-search-input',
  imports: [
    InputIcon,
    IconField,
    IconFieldModule,
    InputIconModule,
    InputText,
    FormsModule
  ],
  templateUrl: './search-input.component.html',
  standalone: true,
  styleUrl: './search-input.component.css'
})
export class SearchInputComponent {
  readonly equipmentSearchStore = inject(EquipmentSearchStore);
  value: string = '';

  onInputChange(event: string) {
    this.equipmentSearchStore.setSearchTerm(event);
  }
}
