import { ServiceTypeEnum } from '../../../shared/model';
import { CabinetEntity } from '../../../entities/cabinet/model';
import { PanelEntity } from '../../../entities/panel/model';
import {DateUtils} from '../../../shared/utils/DateUtils';

export function getLastServiceDate(
  serviceType: ServiceTypeEnum,
  equipment: CabinetEntity | PanelEntity
): Date | null {
  switch (serviceType) {
    case ServiceTypeEnum.MAINTENANCE:
      return equipment.lastMaintenanceAt;
    case ServiceTypeEnum.INSPECTION:
      return equipment.lastInspectionAt;
    case ServiceTypeEnum.RAISE_OBSERVATION:
      return equipment.lastRaiseObservationsAt;
    default:
      return null;
  }
}

export function getLastServiceLabel(serviceType: ServiceTypeEnum): string {
  const labels: Record<ServiceTypeEnum, string> = {
    [ServiceTypeEnum.MAINTENANCE]: 'Último Mantenimiento',
    [ServiceTypeEnum.INSPECTION]: 'Última Inspección',
    [ServiceTypeEnum.RAISE_OBSERVATION]: 'Último Levantamiento'
  };
  return labels[serviceType] || 'Último Servicio';
}

export function getNoServiceMessage(serviceType: ServiceTypeEnum): string {
  const messages: Record<ServiceTypeEnum, string> = {
    [ServiceTypeEnum.MAINTENANCE]: 'No se ha realizado un mantenimiento hasta el momento',
    [ServiceTypeEnum.INSPECTION]: 'No se ha realizado una inspección hasta el momento',
    [ServiceTypeEnum.RAISE_OBSERVATION]: 'No se ha realizado un levantamiento de observaciones hasta el momento'
  };
  return messages[serviceType] || 'Primer servicio de este tipo';
}

export function formatLastServiceDate(
  serviceType: ServiceTypeEnum,
  equipment: CabinetEntity | PanelEntity
): string {
  const date = getLastServiceDate(serviceType, equipment);

  if (!date) {
    return getNoServiceMessage(serviceType);
  }

  return DateUtils.formatDateShort(date);
}
