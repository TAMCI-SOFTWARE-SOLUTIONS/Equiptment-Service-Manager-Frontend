import {CreatePanelTypeRequest} from './create-panel-type-request.type';
import {PanelTypeEntity} from '../model/panel-type.entity';

export class CreatePanelTypeRequestFromEntityMapper {
  static fromEntityToDto(entity: PanelTypeEntity): CreatePanelTypeRequest {
    return {
      code: entity.code,
      name: entity.name,
    };
  }
}
