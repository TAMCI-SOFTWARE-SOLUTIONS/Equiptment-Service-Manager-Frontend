import { ItemConditionEnum } from '../../model';

export class ItemConditionMapper {
  static fromStringToEnum(condition: string): ItemConditionEnum {
    const validConditions = Object.values(ItemConditionEnum) as string[];

    const normalizedCondition = condition.toLowerCase();

    if (validConditions.includes(normalizedCondition)) {
      return normalizedCondition as ItemConditionEnum;
    }
    console.warn(`Invalid item condition received: "${condition}". Defaulting to OK.`);
    return ItemConditionEnum.OK;
  }

  static fromEnumToString(condition: ItemConditionEnum): string {
    return condition;
  }
}
