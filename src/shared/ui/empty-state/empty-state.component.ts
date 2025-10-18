import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-empty-state',
  imports: [
    Ripple
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi-inbox';
  @Input() iconBgClass: string = 'bg-gradient-to-br from-sky-100 to-cyan-100';
  @Input() iconColorClass: string = 'text-sky-600';
  @Input() title: string = 'No hay elementos';
  @Input() description: string = 'Comienza agregando el primer elemento.';
  @Input() showButton: boolean = true;
  @Input() buttonText: string = 'Crear Nuevo';
  @Input() buttonIcon: string = 'pi-plus';

  @Output() onAction = new EventEmitter<void>();
}
