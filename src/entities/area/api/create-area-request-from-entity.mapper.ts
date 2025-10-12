import {AreaEntity} from '../model';
import {CreateAreaRequest} from './create-area-request.type';

export class CreateAreaRequestFromEntityMapper {
  static fromEntityToDto(entity: AreaEntity): CreateAreaRequest {
    return {
      plantId: entity.plantId,
      name: entity.name,
      code: entity.code,
      allowedEquipmentTypes: entity.allowedEquipmentTypes,
    };
  }
}
