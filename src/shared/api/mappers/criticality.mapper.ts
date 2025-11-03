import { CriticalityEnum } from '../../model/enums/criticality.enum';

export class CriticalityMapper {
  static fromStringToEnum(criticality: string): CriticalityEnum | null {
    const criticalityKey = Object.keys(CriticalityEnum).find(
      key => CriticalityEnum[key as keyof typeof CriticalityEnum] === criticality
    );

    if (criticalityKey) {
      return CriticalityEnum[criticalityKey as keyof typeof CriticalityEnum];
    }

    return null;
  }

  static fromEnumToString(criticality: CriticalityEnum | null): string | null {
    return criticality;
  }
}
