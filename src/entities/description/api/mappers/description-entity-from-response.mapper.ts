import { DescriptionResponse } from '../types/description-response.type';
import { DescriptionEntity } from '../../model/entities/description.entity';

export class DescriptionEntityFromResponseMapper {
  static fromDtoToEntity(dto: DescriptionResponse): DescriptionEntity {
    return {
      // IDs and strings (required, provide defaults)
      id: dto.id ?? '',
      name: dto.name ?? '',
      modelId: '',
      brandId: '',
    };
  }
}
