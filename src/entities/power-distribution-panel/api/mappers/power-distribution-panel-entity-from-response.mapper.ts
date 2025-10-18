import { PowerDistributionPanelResponse } from '../types/power-distribution-panel-response.type';
import { PowerDistributionPanelEntity } from '../../model';
import {PowerDistributionPanelTypeMapper} from './power-distribution-panel-type.mapper';

export class PowerDistributionPanelEntityFromResponseMapper {
  static fromDtoToEntity(dto: PowerDistributionPanelResponse): PowerDistributionPanelEntity {
    return {
      id: dto.id ?? '',
      code: dto.code ?? '',
      type: PowerDistributionPanelTypeMapper.mapStringToType(dto.type ?? ''),
    };
  }
}
