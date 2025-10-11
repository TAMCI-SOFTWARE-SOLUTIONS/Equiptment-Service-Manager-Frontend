import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RequestCodeStore} from '../../model';

@Component({
  selector: 'app-request-code',
  imports: [
    ReactiveFormsModule
  ],
  providers: [RequestCodeStore],
  templateUrl: './request-code.component.html',
  standalone: true,
  styleUrl: './request-code.component.css'
})
export class RequestCodeComponent {

}
