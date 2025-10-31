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
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case ServiceStatusEnum.CREATED:
      return `${baseClasses} bg-gray-100 text-gray-700`;
    case ServiceStatusEnum.IN_PROGRESS:
      return `${baseClasses} bg-blue-100 text-blue-700`;
    case ServiceStatusEnum.COMPLETED:
      return `${baseClasses} bg-green-100 text-green-700`;
    case ServiceStatusEnum.CANCELLED:
      return `${baseClasses} bg-rose-100 text-rose-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700`;
  }
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
