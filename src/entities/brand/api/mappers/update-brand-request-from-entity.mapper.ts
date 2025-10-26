import { BrandEntity } from '../../model/entities/brand.entity';
import { UpdateBrandRequest } from '../types/update-brand-request.type';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class UpdateBrandRequestFromEntityMapper {
  static fromEntityToDto(entity: BrandEntity): UpdateBrandRequest {
    return {
      name: entity.name,
      type: InspectableItemTypeMapper.fromEnumToString(entity.type),
    };
  }
}
