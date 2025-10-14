import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PlantEntity} from '../../../../entities/plant';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-plant-card',
  standalone: true,
  imports: [
    Ripple
  ],
  templateUrl: './plant-card.component.html',
  styleUrl: './plant-card.component.css'
})
export class PlantCardComponent {
  @Input() plant!: PlantEntity;

  @Output() onView = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
}
