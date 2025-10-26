import { InspectableItemTypeEnum } from '../../model';

export class InspectableItemTypeMapper {
  static fromStringToEnum(type: string): InspectableItemTypeEnum {
    const normalized = (type ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(InspectableItemTypeEnum).find(key => {
      const val = InspectableItemTypeEnum[key as keyof typeof InspectableItemTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return InspectableItemTypeEnum[typeKey as keyof typeof InspectableItemTypeEnum];
    }

    console.warn(`Invalid inspectable item type received: ${type}, defaulting to OTHERS`);
    return InspectableItemTypeEnum.OTHERS;
  }

  static fromEnumToString(type: InspectableItemTypeEnum): string {
    return type;
  }
}
