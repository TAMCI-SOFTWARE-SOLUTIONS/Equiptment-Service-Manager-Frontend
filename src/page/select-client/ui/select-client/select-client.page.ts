import { Component } from '@angular/core';
import {
  SelectListClientComponent
} from '../../../../features/select-list-client/ui';

@Component({
  selector: 'app-select-client',
  imports: [
    SelectListClientComponent
  ],
  templateUrl: './select-client.page.html',
  standalone: true,
  styleUrl: './select-client.page.css'
})
export class SelectClientPage {

}
