import {CabinetStatusEnum} from '../../cabinet/model';
import {PanelStatusEnum} from '../../panel/model';

export enum EquipmentStatusEnum {
  OPERATIVE = 'OPERATIVE',
  STAND_BY = 'STAND_BY',
  INOPERATIVE = 'INOPERATIVE',
  RETIRED = 'RETIRED'
}

export function getEquipmentStatusLabel(status: EquipmentStatusEnum): string {
  const labels: Record<EquipmentStatusEnum, string> = {
    [EquipmentStatusEnum.OPERATIVE]: 'Operativo',
    [EquipmentStatusEnum.STAND_BY]: 'En Espera',
    [EquipmentStatusEnum.INOPERATIVE]: 'Inoperativo',
    [EquipmentStatusEnum.RETIRED]: 'Retirado'
  };
  return labels[status];
}

export function getEquipmentStatusColor(status: EquipmentStatusEnum): {
  bg: string;
  text: string;
  border: string;
  indicator: string;
} {
  const colors: Record<EquipmentStatusEnum, { bg: string; text: string; border: string; indicator: string }> = {
    [EquipmentStatusEnum.OPERATIVE]: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      indicator: 'bg-green-500'
    },
    [EquipmentStatusEnum.STAND_BY]: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      indicator: 'bg-yellow-500'
    },
    [EquipmentStatusEnum.INOPERATIVE]: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      indicator: 'bg-red-500'
    },
    [EquipmentStatusEnum.RETIRED]: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      indicator: 'bg-gray-500'
    }
  };
  return colors[status];
}

export function getEquipmentStatusBadgeClass(status: EquipmentStatusEnum): string {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold';

  const statusClasses: Record<EquipmentStatusEnum, string> = {
    [EquipmentStatusEnum.OPERATIVE]: 'bg-green-100 text-green-700 ring-1 ring-green-600/20',
    [EquipmentStatusEnum.STAND_BY]: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
    [EquipmentStatusEnum.INOPERATIVE]: 'bg-red-100 text-red-700 ring-1 ring-red-600/20',
    [EquipmentStatusEnum.RETIRED]: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
  };

  return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`;
}

export function getEquipmentStatusIcon(status: EquipmentStatusEnum): string {
  const icons: Record<EquipmentStatusEnum, string> = {
    [EquipmentStatusEnum.OPERATIVE]: 'pi-check-circle',
    [EquipmentStatusEnum.STAND_BY]: 'pi-clock',
    [EquipmentStatusEnum.INOPERATIVE]: 'pi-times-circle',
    [EquipmentStatusEnum.RETIRED]: 'pi-ban'
  };
  return icons[status];
}

export function toEquipmentStatus(
  status: CabinetStatusEnum | PanelStatusEnum | EquipmentStatusEnum | string
): EquipmentStatusEnum {
  // Si ya es EquipmentStatusEnum, retornar directamente
  if (Object.values(EquipmentStatusEnum).includes(status as EquipmentStatusEnum)) {
    return status as EquipmentStatusEnum;
  }

  // Mapeo de valores
  const statusMap: Record<string, EquipmentStatusEnum> = {
    'OPERATIVE': EquipmentStatusEnum.OPERATIVE,
    'STAND_BY': EquipmentStatusEnum.STAND_BY,
    'INOPERATIVE': EquipmentStatusEnum.INOPERATIVE,
    'RETIRED': EquipmentStatusEnum.RETIRED
  };

  return statusMap[status] || EquipmentStatusEnum.OPERATIVE;
}
