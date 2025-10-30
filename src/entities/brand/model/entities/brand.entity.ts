import {ModelEntity} from '../../../model';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';

export interface BrandEntity {
  id: string;
  name: string;
  type: InspectableItemTypeEnum;
  totalModels: number;
  models: ModelEntity[];
}
