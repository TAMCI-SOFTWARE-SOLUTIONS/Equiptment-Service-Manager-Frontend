import {EquipmentTypeEnum} from '../../../shared/model';

export interface AreaEntity {
  id: string;
  plantId: string;
  name: string;
  code: string;
  allowedEquipmentTypes: EquipmentTypeEnum[];
}
