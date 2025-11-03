import { ItemInspectionResponse } from '../types/item-inspection-response.type';
import { ItemInspectionEntity } from '../../model';
import {InspectableItemTypeMapper} from '../../../../shared/api/mappers/inspectable-item-type.mapper';
import {ItemConditionMapper} from '../../../../shared/api/mappers/item-condition.mapper';
import {CriticalityMapper} from '../../../../shared/api/mappers/criticality.mapper';

export class ItemInspectionEntityFromResponseMapper {
  static fromDtoToEntity(dto: ItemInspectionResponse): ItemInspectionEntity {
    return {
      id: dto.id ?? '',
      itemId: dto.itemId ?? '',
      itemType: InspectableItemTypeMapper.fromStringToEnum(dto.itemType ?? ''),
      condition: ItemConditionMapper.fromStringToEnum(dto.condition ?? ''),
      criticality: CriticalityMapper.fromStringToEnum(dto.criticality ?? ''),
      observation: dto.observation ?? '',
      previousTag: dto.previousTag ?? '',
      previousBrandId: dto.previousBrandId ?? '',
      previousModelId: dto.previousModelId ?? '',
      previousDescriptionId: dto.previousDescriptionId ?? '',
      previousCondition: ItemConditionMapper.fromStringToEnum(dto.previousCondition ?? ''),
      previousCriticality: CriticalityMapper.fromStringToEnum(dto.previousCriticality ?? ''),
      previousObservation: dto.previousObservation ?? '',
    }
  }
}
