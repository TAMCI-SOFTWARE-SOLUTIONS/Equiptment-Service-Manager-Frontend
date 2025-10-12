import { GenderEnum } from '../../model';

export class GenderMapper {
  static mapStringToGender(gender: string): GenderEnum {
    const normalized = (gender ?? '').toString().trim().toLowerCase();

    const genderKey = Object.keys(GenderEnum).find(key => {
      const val = GenderEnum[key as keyof typeof GenderEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (genderKey) {
      return GenderEnum[genderKey as keyof typeof GenderEnum];
    }

    console.warn(`Invalid gender received: ${gender}, defaulting to MALE`);
    return GenderEnum.MALE;
  }

  static mapGenderToString(gender: GenderEnum): string {
    return String(gender);
  }
}
