import { Component } from '@angular/core';
import {RequestCodeComponent} from '../../../../features/request-code/ui';

@Component({
  selector: 'app-login',
  imports: [
    RequestCodeComponent
  ],
  templateUrl: './login.page.html',
  standalone: true,
  styleUrl: './login.page.css'
})
export class LoginPage {

}
