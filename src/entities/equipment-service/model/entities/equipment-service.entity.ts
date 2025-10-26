import {ServiceStatusEnum} from '../enums/service-status.enum';
import {EquipmentTypeEnum, ServiceTypeEnum} from '../../../../shared/model';

export interface EquipmentServiceEntity {
  id: string;
  projectId: string;
  equipmentId: string;
  equipmentType: EquipmentTypeEnum;
  status: ServiceStatusEnum;
  supervisorId: string;
  type: ServiceTypeEnum;
  previousServiceId: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  totalWorkDuration: string;
  videoStartFileId: string;
  videoEndFileId: string;
  startPhotos: string[];
  midPhotos: string[];
  endPhotos: string[];
  reportDocumentFileId: string;
}
