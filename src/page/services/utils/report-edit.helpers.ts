// src/app/pages/service-details/utils/report-edit.helpers.ts

import {EquipmentServiceEntity, ServiceStatusEnum} from '../../../entities/equipment-service';

/**
 * Verifica si el usuario puede editar el reporte
 */
export function canEditReport(
  service: EquipmentServiceEntity,
  userRole: string
): boolean {
  // Solo servicios completados
  if (service.status !== ServiceStatusEnum.COMPLETED) {
    return false;
  }

  // Solo operadores
  if (userRole !== 'OPERATOR') {
    return false;
  }

  // ✅ DESCOMENTAR ESTA LÍNEA PARA BLOQUEAR EDICIÓN SI YA HAY REPORTE
  // if (service.reportDocumentFileId !== null) {
  //   return false;
  // }

  // Dentro de 30 días desde completado
  const daysSinceCompletion = getDaysSinceCompletion(service);
  return daysSinceCompletion <= 30;
}

/**
 * Calcula días desde que se completó el servicio
 */
export function getDaysSinceCompletion(service: EquipmentServiceEntity): number {
  if (!service.completedAt) return 0;

  const now = new Date();
  const completed = new Date(service.completedAt);
  const diffMs = now.getTime() - completed.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calcula días restantes para editar
 */
export function getDaysRemainingToEdit(service: EquipmentServiceEntity): number {
  const daysSince = getDaysSinceCompletion(service);
  const remaining = 30 - daysSince;
  return remaining > 0 ? remaining : 0;
}

/**
 * Obtiene el mensaje según estado del reporte
 */
export function getReportStatusMessage(service: EquipmentServiceEntity): string {
  const daysRemaining = getDaysRemainingToEdit(service);

  if (service.reportDocumentFileId) {
    return 'Reporte cargado';
  }

  if (daysRemaining > 0) {
    return `Disponible por ${daysRemaining} día(s)`;
  }

  return 'Plazo vencido';
}

/**
 * Verifica si debe mostrar el mensaje de plazo vencido
 */
export function shouldShowExpiredMessage(service: EquipmentServiceEntity): boolean {
  return !service.reportDocumentFileId && getDaysRemainingToEdit(service) === 0;
}
