import { Component } from '@angular/core';
import {SelectListProjectComponent} from '../../../../features/select-list-project/ui';

@Component({
  selector: 'app-select-project',
  imports: [
    SelectListProjectComponent
  ],
  templateUrl: './select-project.page.html',
  standalone: true,
  styleUrl: './select-project.page.css'
})
export class SelectProjectPage {

}
