import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {SendCodeStore} from '../../model';

@Component({
  selector: 'app-send-verification-code-form',
  imports: [
    ReactiveFormsModule
  ],
  providers: [SendCodeStore],
  templateUrl: './send-verification-code-form.component.html',
  standalone: true,
  styleUrl: './send-verification-code-form.component.css'
})
export class SendVerificationCodeFormComponent{

}
