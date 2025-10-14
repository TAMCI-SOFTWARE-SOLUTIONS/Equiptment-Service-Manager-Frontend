import {UpdateAreaRequest} from './update-area-request.type';
import {AreaEntity} from '../model';
import {EquipmentTypeMapper} from './equipment-type.mapper';

export class UpdateAreaRequestFromEntityMapper {
  static fromEntityToDto(entity: AreaEntity): UpdateAreaRequest {
    return {
      name: entity.name,
      code: entity.code,
      allowedEquipmentTypes: entity.allowedEquipmentTypes.map(type =>
        EquipmentTypeMapper.mapStringToEquipmentType(type)
      ),
    };
  }
}
