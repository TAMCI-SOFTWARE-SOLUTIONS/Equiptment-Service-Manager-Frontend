import { BrandResponse } from '../types/brand-response.type';
import { BrandEntity } from '../../model/entities/brand.entity';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class BrandEntityFromResponseMapper {
  static fromDtoToEntity(dto: BrandResponse): BrandEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      type: InspectableItemTypeMapper.fromStringToEnum(dto.type ?? ''),
      models: [],
      totalModels: dto.totalModels ?? 0,
    };
  }
}
