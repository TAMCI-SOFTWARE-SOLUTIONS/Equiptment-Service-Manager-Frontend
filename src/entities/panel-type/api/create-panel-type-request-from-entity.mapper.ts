import {PanelTypeEntity} from '../model';
import {CreatePanelTypeRequest} from './create-panel-type-request.type';

export class CreatePanelTypeRequestFromEntityMapper {
  static fromEntityToDto(entity: PanelTypeEntity): CreatePanelTypeRequest {
    return {
      code: entity.code,
      name: entity.name,
    };
  }
}
