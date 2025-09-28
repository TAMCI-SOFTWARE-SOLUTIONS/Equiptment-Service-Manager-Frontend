import {EquipmentTypeEnum} from '../../../shared/model';

export interface AreaEntity {
  id: string;
  name: string;
  code: string;
  allowedEquipmentTypes: EquipmentTypeEnum[];
}
