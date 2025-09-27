import {Component, EventEmitter, Output} from '@angular/core';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-flow-buttons',
  imports: [
    Button
  ],
  templateUrl: './flow-buttons.component.html',
  standalone: true,
  styleUrl: './flow-buttons.component.css'
})
export class FlowButtonsComponent {
   @Output() back = new EventEmitter<void>();
   @Output() next = new EventEmitter<void>();

   onGoBack() {
      this.back.emit();
   }

    onGoNext() {
        this.next.emit();
    }
}
