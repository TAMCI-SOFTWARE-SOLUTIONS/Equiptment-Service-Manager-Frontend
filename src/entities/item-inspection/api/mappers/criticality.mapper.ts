import { CriticalityEnum } from '../../model';


export class CriticalityMapper {

  static fromStringToEnum(criticality: string): CriticalityEnum | null {
    if (!criticality) {return null;}

    const validCriticalities = Object.values(CriticalityEnum) as string[];

    const normalizedCriticality = criticality.toLowerCase();

    if (validCriticalities.includes(normalizedCriticality)) {
      return normalizedCriticality as CriticalityEnum;
    }

    console.warn(`Invalid criticality received: "${criticality}". Setting to null.`);
    return null;
  }

  static fromEnumToString(criticality: CriticalityEnum | null): string | null {
    return criticality;
  }
}
