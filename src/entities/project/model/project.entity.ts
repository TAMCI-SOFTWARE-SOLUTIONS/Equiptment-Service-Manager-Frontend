import {ProjectStatusEnum} from './project-status.enum';
import {EquipmentTypeEnum} from '../../../shared/model';

export interface ProjectEntity {
  id: string;
  name: string;
  code: string;
  description: string;
  clientId: string;
  bannerId: string | null;
  startAt: Date | null;
  completionAt: Date | null;
  cancelledAt: Date | null;
  status: ProjectStatusEnum;
  allowedEquipmentTypes: EquipmentTypeEnum[];
}
