import {Component, EventEmitter, inject, Output} from '@angular/core';
import {Button} from 'primeng/button';
import {EquipmentSearchStore} from '../../model';

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

  readonly equipmentSearchStore = inject(EquipmentSearchStore);

   onGoBack() {
      this.back.emit();
   }

    onGoNext() {
        this.next.emit();
    }
}
