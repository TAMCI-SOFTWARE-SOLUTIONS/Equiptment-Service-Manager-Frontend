import { BrandEntity } from '../../model/entities/brand.entity';
import { CreateBrandRequest } from '../types/create-brand-request.type';
import { InspectableItemTypeMapper } from '../../../../shared/api/mappers/inspectable-item-type.mapper';

export class CreateBrandRequestFromEntityMapper {
  static fromEntityToDto(entity: BrandEntity): CreateBrandRequest {
    return {
      name: entity.name,
      type: InspectableItemTypeMapper.fromEnumToString(entity.type),
    };
  }
}
