import { DescriptionEntity } from '../../model/entities/description.entity';
import { CreateDescriptionRequest } from '../types/create-description-request.type';

export class CreateDescriptionRequestFromEntityMapper {
  static fromEntityToDto(entity: DescriptionEntity): CreateDescriptionRequest {
    return {
      name: entity.name,
      modelId: entity.modelId,
      brandId: entity.brandId,
    };
  }
}
