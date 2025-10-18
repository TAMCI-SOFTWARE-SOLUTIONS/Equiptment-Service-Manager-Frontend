import { Component } from '@angular/core';
import { LoginFormFeature } from '../../../../features/login-form/ui';

@Component({
  selector: 'app-login',
  imports: [
    LoginFormFeature
  ],
  templateUrl: './login.page.html',
  standalone: true,
  styleUrl: './login.page.css'
})
export class LoginPage {

}
