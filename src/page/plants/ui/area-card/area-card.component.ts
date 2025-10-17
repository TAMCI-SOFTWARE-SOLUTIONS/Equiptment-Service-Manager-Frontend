import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AreaEntity} from '../../../../entities/area/model';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-area-card',
  imports: [
    Ripple
  ],
  templateUrl: './area-card.component.html',
  styleUrl: './area-card.component.css'
})
export class AreaCardComponent {
  @Input() area!: AreaEntity;

  @Output() onView = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();

  getEquipmentLabel(type: EquipmentTypeEnum): string {
    const labels: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'Gabinete',
      [EquipmentTypeEnum.PANEL]: 'Panel'
    };
    return labels[type] || type;
  }
}
