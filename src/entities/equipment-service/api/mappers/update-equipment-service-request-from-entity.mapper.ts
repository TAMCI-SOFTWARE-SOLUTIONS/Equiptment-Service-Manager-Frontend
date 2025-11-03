import { EquipmentServiceEntity } from '../../model/entities/equipment-service.entity';
import { UpdateEquipmentServiceRequest } from '../types/update-equipment-service-request.type';

export class UpdateEquipmentServiceRequestFromEntityMapper {
  static fromEntityToDto(entity: EquipmentServiceEntity): UpdateEquipmentServiceRequest {
    return {
      equipmentId: entity.equipmentId,
      equipmentType: entity.equipmentType,
      supervisorId: entity.supervisorId,
      videoStartFileId: entity.videoStartFileId,
      videoEndFileId: entity.videoEndFileId,
      startPhotos: entity.startPhotos,
      midPhotos: entity.midPhotos,
      endPhotos: entity.endPhotos,
      reportDocumentFileId: entity.reportDocumentFileId,
    };
  }
}