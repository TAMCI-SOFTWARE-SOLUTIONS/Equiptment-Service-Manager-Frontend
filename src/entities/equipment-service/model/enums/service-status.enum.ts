export enum ServiceStatusEnum {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Helper para obtener clase de badge de estado de servicio
 * @param status
 */
export function getStatusBadgeClass(status: ServiceStatusEnum): string {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold';

  const statusClasses: Record<ServiceStatusEnum, string> = {
    [ServiceStatusEnum.CREATED]: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20',
    [ServiceStatusEnum.IN_PROGRESS]: 'bg-sky-100 text-sky-700 ring-1 ring-sky-600/20',
    [ServiceStatusEnum.COMPLETED]: 'bg-green-100 text-green-700 ring-1 ring-green-600/20',
    [ServiceStatusEnum.CANCELLED]: 'bg-red-100 text-red-700 ring-1 ring-red-600/20'
  };

  return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`;
}

/**
 * Helper para obtener label del estado de servicio
 * @param status
 */
export function getStatusLabel(status: ServiceStatusEnum): string {
  const labels: Record<ServiceStatusEnum, string> = {
    [ServiceStatusEnum.CREATED]: 'Creado',
    [ServiceStatusEnum.IN_PROGRESS]: 'En Progreso',
    [ServiceStatusEnum.COMPLETED]: 'Completado',
    [ServiceStatusEnum.CANCELLED]: 'Cancelado'
  };
  return labels[status] || status;
}

/**
 * Helper para obtener icono del estado de servicio
 * @param status
 */
export function getStatusIcon(status: ServiceStatusEnum): string {
  const icons: Record<ServiceStatusEnum, string> = {
    [ServiceStatusEnum.CREATED]: 'pi pi-circle',
    [ServiceStatusEnum.IN_PROGRESS]: 'pi pi-spin pi-spinner',
    [ServiceStatusEnum.COMPLETED]: 'pi pi-check-circle',
    [ServiceStatusEnum.CANCELLED]: 'pi pi-times-circle'
  };
  return icons[status] || 'pi pi-circle';
}
