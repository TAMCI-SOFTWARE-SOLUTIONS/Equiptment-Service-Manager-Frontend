import { InspectableItemResponse } from '../types';
import { InspectableItemEntity } from '../../model';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';
import {CriticalityMapper, ItemConditionMapper} from '../../../item-inspection';

export class InspectableItemEntityFromResponseMapper {
  static fromDtoToEntity(dto: InspectableItemResponse): InspectableItemEntity {
    return {
      id: dto.id ?? '',
      tag: dto.tag ?? '',
      type: InspectableItemTypeMapper.fromStringToEnum(dto.type ?? ''),
      brandId: dto.brandId ?? '',
      modelId: dto.modelId ?? '',
      descriptionId: dto.descriptionId ?? '',
      currentCondition: ItemConditionMapper.fromStringToEnum(dto.currentCondition ?? ''),
      currentCriticality: CriticalityMapper.fromStringToEnum(dto.currentCriticality ?? ''),
      lastObservation: dto.lastObservation ?? '',
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
    };
  }
}
