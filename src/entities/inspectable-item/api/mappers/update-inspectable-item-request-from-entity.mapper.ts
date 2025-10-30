import {InspectableItemEntity} from '../../model';
import {UpdateInspectableItemRequest} from '../types';
import {InspectableItemTypeMapper} from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class UpdateInspectableItemRequestFromEntityMapper {
  static fromEntityToDto(entity: InspectableItemEntity): UpdateInspectableItemRequest {
    return {
      tag: entity.tag,
      type: InspectableItemTypeMapper.fromEnumToString(entity.type),
      brandId: entity.brandId,
      modelId: entity.modelId,
      descripcion: entity.descriptionId,
    };
  }
}
