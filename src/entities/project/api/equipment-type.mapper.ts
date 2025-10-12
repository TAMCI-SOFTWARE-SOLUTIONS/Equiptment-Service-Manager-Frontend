import {EquipmentTypeEnum} from '../../../shared/model';


export class EquipmentTypeMapper {
  static fromStringToEnum(equipmentType: string): EquipmentTypeEnum {
    const validTypes = Object.values(EquipmentTypeEnum) as string[];
    const normalizedType = equipmentType?.toLowerCase();

    if (validTypes.includes(normalizedType)) {
      return normalizedType as EquipmentTypeEnum;
    }
    console.warn(
      `Invalid equipment type received: "${equipmentType}". Defaulting to CABINET.`
    );
    return EquipmentTypeEnum.CABINET;
  }
  static fromEnumToString(equipmentType: EquipmentTypeEnum): string {
    return equipmentType;
  }

  static fromStringArrayToEnumArray(equipmentTypes: string[]): EquipmentTypeEnum[] {
    return equipmentTypes?.map(type => this.fromStringToEnum(type)) || [];
  }

  static fromEnumArrayToStringArray(equipmentTypes: EquipmentTypeEnum[]): string[] {
    return equipmentTypes?.map(type => this.fromEnumToString(type)) || [];
  }
}
