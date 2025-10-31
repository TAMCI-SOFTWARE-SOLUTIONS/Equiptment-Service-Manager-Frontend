export enum ServiceTypeEnum {
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  RAISE_OBSERVATION = 'RAISE_OBSERVATION',
}

/**
 * Helper para obtener label del tipo de servicio
 * @param type
 */
export function getServiceTypeLabel(type: ServiceTypeEnum): string {
  const labels: Record<ServiceTypeEnum, string> = {
    [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
    [ServiceTypeEnum.INSPECTION]: 'Inspección',
    [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento'
  };
  return labels[type] || type;
}
