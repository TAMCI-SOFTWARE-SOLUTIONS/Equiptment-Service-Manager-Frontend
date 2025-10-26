import { InspectableItemResponse } from '../types';
import { InspectableItemEntity } from '../../model';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class InspectableItemEntityFromResponseMapper {
  static fromDtoToEntity(dto: InspectableItemResponse): InspectableItemEntity {
    return {
      id: dto.id ?? '',
      tag: dto.tag ?? '',
      type: InspectableItemTypeMapper.fromStringToEnum(dto.type ?? ''),
      brandId: dto.brandId ?? '',
      modelId: dto.modelId ?? '',
      descripcion: dto.descripcion ?? '',
    };
  }
}
