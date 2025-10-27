import { ItemInspectionResponse } from '../types/item-inspection-response.type';
import { ItemInspectionEntity } from '../../model';
import { ItemConditionMapper } from './item-condition.mapper';
import { CriticalityMapper } from './criticality.mapper';
import {InspectableItemTypeMapper} from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class ItemInspectionEntityFromResponseMapper {
  static fromDtoToEntity(dto: ItemInspectionResponse): ItemInspectionEntity {
    return {
      id: dto.id ?? '',
      itemId: dto.itemId ?? '',

      itemType: InspectableItemTypeMapper.fromStringToEnum(dto.itemType ?? ''),
      condition: ItemConditionMapper.fromStringToEnum(dto.condition ?? ''),
      criticality: CriticalityMapper.fromStringToEnum(dto.criticality ?? ''),

      observation: dto.observation ?? '',
    };
  }
}
