import { EquipmentTypeEnum } from '../../../shared/model';

export class EquipmentTypeMapper {
  static mapStringToEquipmentType(equipmentType: string): EquipmentTypeEnum {
    const normalized = (equipmentType ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(EquipmentTypeEnum).find(key => {
      const val = EquipmentTypeEnum[key as keyof typeof EquipmentTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return EquipmentTypeEnum[typeKey as keyof typeof EquipmentTypeEnum];
    }

    console.warn(`Invalid equipment type received: ${equipmentType}, defaulting to CABINET`);
    return EquipmentTypeEnum.CABINET;
  }

  static mapEquipmentTypeToString(equipmentType: EquipmentTypeEnum): string {
    return String(equipmentType);
  }
}
