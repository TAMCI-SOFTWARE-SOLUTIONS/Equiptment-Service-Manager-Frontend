import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { ProjectWithClient } from '../../model/projects.store';
import { ProjectStatusEnum } from '../../../../entities/project/model/project-status.enum';
import { EquipmentTypeEnum } from '../../../../shared/model';
import {getEquipmentTypeIcon, getEquipmentTypeLabel} from '../../../../entities/equipment/model/equipment-type.enum';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, Ripple],
  templateUrl: './project-card.component.html'
})
export class ProjectCardComponent {
  // Inputs
  readonly project = input.required<ProjectWithClient>();
  readonly isLoading = input<boolean>(false);

  // Outputs
  readonly projectClick = output<string>();

  // Expose enums
  readonly ProjectStatusEnum = ProjectStatusEnum;
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  onCardClick(): void {
    if (!this.isLoading()) {
      this.projectClick.emit(this.project().id);
    }
  }

  getStatusColor(status: ProjectStatusEnum): string {
    const colors: Record<ProjectStatusEnum, string> = {
      [ProjectStatusEnum.PLANNED]: 'bg-sky-50 text-sky-700 border-sky-200',
      [ProjectStatusEnum.IN_PROGRESS]: 'bg-sky-100 text-sky-800 border-sky-300',
      [ProjectStatusEnum.COMPLETED]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      [ProjectStatusEnum.ON_HOLD]: 'bg-gray-100 text-gray-700 border-gray-300',
      [ProjectStatusEnum.CANCELLED]: 'bg-gray-200 text-gray-600 border-gray-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getStatusLabel(status: ProjectStatusEnum): string {
    const labels: Record<ProjectStatusEnum, string> = {
      [ProjectStatusEnum.PLANNED]: 'Planificado',
      [ProjectStatusEnum.IN_PROGRESS]: 'En Progreso',
      [ProjectStatusEnum.COMPLETED]: 'Completado',
      [ProjectStatusEnum.ON_HOLD]: 'En Espera',
      [ProjectStatusEnum.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: ProjectStatusEnum): string {
    const icons: Record<ProjectStatusEnum, string> = {
      [ProjectStatusEnum.PLANNED]: 'pi-calendar',
      [ProjectStatusEnum.IN_PROGRESS]: 'pi-clock',
      [ProjectStatusEnum.COMPLETED]: 'pi-check-circle',
      [ProjectStatusEnum.ON_HOLD]: 'pi-pause-circle',
      [ProjectStatusEnum.CANCELLED]: 'pi-times-circle'
    };
    return icons[status] || 'pi-circle';
  }

  getEquipmentTypeBadgeColor(type: EquipmentTypeEnum): string {
    const colors: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'bg-sky-100 text-sky-700',
      [EquipmentTypeEnum.PANEL]: 'bg-cyan-100 text-cyan-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }

  protected readonly getEquipmentTypeLabel = getEquipmentTypeLabel;
  protected readonly getEquipmentTypeIcon = getEquipmentTypeIcon;
}
