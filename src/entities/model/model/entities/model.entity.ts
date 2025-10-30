import {DescriptionEntity} from '../../../description/model/entities/description.entity';

export interface ModelEntity {
  id: string;
  name: string;
  brandId: string;
  totalDescriptions: number;
  descriptions: DescriptionEntity[];
}
