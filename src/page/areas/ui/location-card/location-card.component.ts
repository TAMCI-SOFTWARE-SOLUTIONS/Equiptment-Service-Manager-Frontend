import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LocationEntity} from '../../../../entities/location';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-location-card',
  imports: [
    Ripple
  ],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.css'
})
export class LocationCardComponent {
  @Input() location!: LocationEntity;

  @Output() onView = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
}
