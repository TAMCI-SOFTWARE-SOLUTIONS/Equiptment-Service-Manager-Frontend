import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-confirmation-modal',
  imports: [
    Ripple
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  @Input() show: boolean = false;
  @Input() title: string = '¿Eliminar elemento?';
  @Input() message: string = 'Estás a punto de eliminar este elemento.';
  @Input() itemName?: string;
  @Input() warningText: string = 'Esta acción no se puede deshacer.';
  @Input() confirmText: string = 'Sí, eliminar';
  @Input() isLoading: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
