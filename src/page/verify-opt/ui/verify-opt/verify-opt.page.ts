import { Component } from '@angular/core';
import {SendVerificationCodeFormComponent} from '../../../../features/send-verification-code/ui';

@Component({
  selector: 'app-verify-opt',
  imports: [
    SendVerificationCodeFormComponent
  ],
  templateUrl: './verify-opt.page.html',
  standalone: true,
  styleUrl: './verify-opt.page.css'
})
export class VerifyOptPage {

}
