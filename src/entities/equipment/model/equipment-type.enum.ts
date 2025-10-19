export enum EquipmentTypeEnum {
  CABINET = 'CABINET',
  PANEL = 'PANEL'
}

/**
 * Helper para obtener label del tipo
 */
export function getEquipmentTypeLabel(type: EquipmentTypeEnum): string {
  const labels: Record<EquipmentTypeEnum, string> = {
    [EquipmentTypeEnum.CABINET]: 'Gabinete',
    [EquipmentTypeEnum.PANEL]: 'Tablero'
  };
  return labels[type];
}

/**
 * Helper para obtener icono del tipo
 */
export function getEquipmentTypeIcon(type: EquipmentTypeEnum): string {
  const icons: Record<EquipmentTypeEnum, string> = {
    [EquipmentTypeEnum.CABINET]: 'pi pi-server',
    [EquipmentTypeEnum.PANEL]: 'pi pi-th-large'
  };
  return icons[type];
}

/**
 * Helper para obtener emoji del tipo
 */
export function getEquipmentTypeEmoji(type: EquipmentTypeEnum): string {
  const emojis: Record<EquipmentTypeEnum, string> = {
    [EquipmentTypeEnum.CABINET]: '📦',
    [EquipmentTypeEnum.PANEL]: '📋'
  };
  return emojis[type];
}
