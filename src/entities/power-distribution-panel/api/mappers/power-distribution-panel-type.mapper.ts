import { PowerDistributionPanelTypeEnum } from '../../model/enums/power-distribution-panel-type.enum';

export class PowerDistributionPanelTypeMapper {
  static mapStringToType(type: string): PowerDistributionPanelTypeEnum {
    const normalized = (type ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(PowerDistributionPanelTypeEnum).find(key => {
      const val = PowerDistributionPanelTypeEnum[key as keyof typeof PowerDistributionPanelTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return PowerDistributionPanelTypeEnum[typeKey as keyof typeof PowerDistributionPanelTypeEnum];
    }

    console.warn(`Invalid power distribution panel type received: ${type}, defaulting to PDJ`);
    return PowerDistributionPanelTypeEnum.PDJ;
  }

  static mapTypeToString(type: PowerDistributionPanelTypeEnum): string {
    return String(type);
  }
}
