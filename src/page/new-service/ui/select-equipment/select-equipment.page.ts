import { Component } from '@angular/core';
import {SearchContainerComponent} from '../../../../features/equipment-search/ui';

@Component({
  selector: 'app-select-equipment',
  imports: [
    SearchContainerComponent
  ],
  templateUrl: './select-equipment.page.html',
  standalone: true,
  styleUrl: './select-equipment.page.css'
})
export class SelectEquipmentPage {

}
