import { PowerDistributionPanelEntity } from '../../model';
import { CreatePowerDistributionPanelRequest } from '../types/create-power-distribution-panel-request.type';
import {PowerDistributionPanelTypeMapper} from './power-distribution-panel-type.mapper';

export class CreatePowerDistributionPanelRequestFromEntityMapper {
  static fromEntityToDto(entity: PowerDistributionPanelEntity): CreatePowerDistributionPanelRequest {
    return {
      code: entity.code,
      type: PowerDistributionPanelTypeMapper.mapTypeToString(entity.type),
    };
  }
}
