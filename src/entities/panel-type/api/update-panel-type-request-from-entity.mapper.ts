import {PanelTypeEntity} from '../model/panel-type.entity';
import {UpdatePanelTypeRequest} from './update-panel-type-request.type';

export class UpdatePanelTypeRequestFromEntityMapper {
  static fromEntityToDto(entity: PanelTypeEntity): UpdatePanelTypeRequest {
    return {
      code: entity.code,
      name: entity.name,
    };
  }
}
