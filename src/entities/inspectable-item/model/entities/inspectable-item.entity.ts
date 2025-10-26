import { InspectableItemTypeEnum } from '../../../../shared/model/enums';

export interface InspectableItemEntity {
  id: string;
  tag: string;
  type: InspectableItemTypeEnum;
  brandId: string;
  modelId: string;
  descripcion: string;
}
