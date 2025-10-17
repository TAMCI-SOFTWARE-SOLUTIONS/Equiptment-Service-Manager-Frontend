export enum EquipmentStatusEnum {
  OPERATIVE = 'OPERATIVE',
  STAND_BY = 'STAND_BY',
  INOPERATIVE = 'INOPERATIVE',
  RETIRED = 'RETIRED'
}

/**
 * Helper para obtener label del status
 */
export function getEquipmentStatusLabel(status: EquipmentStatusEnum): string {
  const labels: Record<EquipmentStatusEnum, string> = {
    [EquipmentStatusEnum.OPERATIVE]: 'Operativo',
    [EquipmentStatusEnum.STAND_BY]: 'En Espera',
    [EquipmentStatusEnum.INOPERATIVE]: 'Inoperativo',
    [EquipmentStatusEnum.RETIRED]: 'Retirado'
  };
  return labels[status];
}

/**
 * Helper para obtener color del status
 */
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

/**
 * Helper para obtener icono del status
 */
export function getEquipmentStatusIcon(status: EquipmentStatusEnum): string {
  const icons: Record<EquipmentStatusEnum, string> = {
    [EquipmentStatusEnum.OPERATIVE]: 'pi-check-circle',
    [EquipmentStatusEnum.STAND_BY]: 'pi-clock',
    [EquipmentStatusEnum.INOPERATIVE]: 'pi-times-circle',
    [EquipmentStatusEnum.RETIRED]: 'pi-ban'
  };
  return icons[status];
}
