import { ServiceStatusEnum } from '../../model/enums/service-status.enum';

export class ServiceStatusMapper {
  static fromStringToEnum(status: string): ServiceStatusEnum {
    const normalized = (status ?? '').toString().trim().toUpperCase();

    const statusKey = Object.keys(ServiceStatusEnum).find(key => {
      const val = ServiceStatusEnum[key as keyof typeof ServiceStatusEnum];
      return String(val).toUpperCase() === normalized || key.toUpperCase() === normalized;
    });

    if (statusKey) {
      return ServiceStatusEnum[statusKey as keyof typeof ServiceStatusEnum];
    }

    console.warn(`Invalid service status received: ${status}, defaulting to CREATED`);
    return ServiceStatusEnum.CREATED;
  }

  static fromEnumToString(status: ServiceStatusEnum): string {
    return status;
  }
}
