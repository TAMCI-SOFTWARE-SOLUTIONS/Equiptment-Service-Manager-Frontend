import { PowerDistributionPanelResponse } from '../types/power-distribution-panel-response.type';
import { PowerDistributionPanelEntity } from '../../model';

export class PowerDistributionPanelEntityFromResponseMapper {
  static fromDtoToEntity(dto: PowerDistributionPanelResponse): PowerDistributionPanelEntity {
    return {
      id: dto.id ?? '',
      code: dto.code ?? '',
      type: dto.type ?? '',
    };
  }
}
