import { InspectableItemEntity } from '../../model';
import { CreateInspectableItemRequest } from '../types';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class CreateInspectableItemRequestFromEntityMapper {
  static fromEntityToDto(entity: InspectableItemEntity, equipmentId: string): CreateInspectableItemRequest {
    return {
      tag: entity.tag,
      type: InspectableItemTypeMapper.fromEnumToString(entity.type),
      brandId: entity.brandId,
      modelId: entity.modelId,
      descripcion: entity.descriptionId,
      equipmentId: equipmentId,
    };
  }
}
