import { DescriptionEntity } from '../../model/entities/description.entity';
import { UpdateDescriptionRequest } from '../types/update-description-request.type';

export class UpdateDescriptionRequestFromEntityMapper {
  static fromEntityToDto(entity: Partial<DescriptionEntity>): UpdateDescriptionRequest {
    return {
      name: entity.name ?? null,
    };
  }
}
