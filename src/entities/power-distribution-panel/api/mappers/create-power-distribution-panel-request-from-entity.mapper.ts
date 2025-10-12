import { PowerDistributionPanelEntity } from '../../model';
import { CreatePowerDistributionPanelRequest } from '../types/create-power-distribution-panel-request.type';

export class CreatePowerDistributionPanelRequestFromEntityMapper {
  static fromEntityToDto(entity: PowerDistributionPanelEntity): CreatePowerDistributionPanelRequest {
    return {
      code: entity.code,
      type: entity.type,
    };
  }
}
