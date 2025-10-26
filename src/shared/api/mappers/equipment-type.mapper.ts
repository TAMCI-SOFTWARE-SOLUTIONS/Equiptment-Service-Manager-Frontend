import {EquipmentTypeEnum} from '../../model';

export class EquipmentTypeMapper {
  static fromStringToEnum(type: string): EquipmentTypeEnum {
    const normalized = (type ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(EquipmentTypeEnum).find(key => {
      const val = EquipmentTypeEnum[key as keyof typeof EquipmentTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return EquipmentTypeEnum[typeKey as keyof typeof EquipmentTypeEnum];
    }

    console.warn(`Invalid equipment type received: ${type}, defaulting to CABINET`);
    return EquipmentTypeEnum.CABINET;
  }

  static fromEnumToString(type: EquipmentTypeEnum): string {
    return type;
  }
}
