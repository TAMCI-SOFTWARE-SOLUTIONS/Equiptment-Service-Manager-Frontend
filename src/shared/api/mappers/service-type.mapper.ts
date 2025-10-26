import { ServiceTypeEnum } from '../../model';

export class ServiceTypeMapper {
  static fromStringToEnum(type: string): ServiceTypeEnum {
    const normalized = (type ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(ServiceTypeEnum).find(key => {
      const val = ServiceTypeEnum[key as keyof typeof ServiceTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return ServiceTypeEnum[typeKey as keyof typeof ServiceTypeEnum];
    }

    console.warn(`Invalid service type received: ${type}, defaulting to MAINTENANCE`);
    return ServiceTypeEnum.MAINTENANCE;
  }

  static fromEnumToString(type: ServiceTypeEnum): string {
    return type;
  }
}
