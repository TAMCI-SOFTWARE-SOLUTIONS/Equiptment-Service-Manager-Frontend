import { ItemConditionEnum } from '../../model/enums/item-condition.enum';

export class ItemConditionMapper {
  static fromStringToEnum(condition: string): ItemConditionEnum | null {
    const conditionKey = Object.keys(ItemConditionEnum).find(
      key => ItemConditionEnum[key as keyof typeof ItemConditionEnum] === condition
    );

    if (conditionKey) {
      return ItemConditionEnum[conditionKey as keyof typeof ItemConditionEnum];
    }

    return null;
  }

  static fromEnumToString(condition: ItemConditionEnum | null): string | null {
    return condition;
  }
}
