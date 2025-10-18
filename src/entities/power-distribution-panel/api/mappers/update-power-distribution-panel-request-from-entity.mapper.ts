import { PowerDistributionPanelEntity } from '../../model';
import {PowerDistributionPanelTypeMapper} from './power-distribution-panel-type.mapper';
import {UpdatePowerDistributionPanelRequest} from '../types/update-power-distribution-panel-request.type';

export class UpdatePowerDistributionPanelRequestFromEntityMapper {
  static fromEntityToDto(entity: PowerDistributionPanelEntity): UpdatePowerDistributionPanelRequest {
    return {
      id: entity.id,
      code: entity.code,
      type: PowerDistributionPanelTypeMapper.mapTypeToString(entity.type),
    };
  }
}
