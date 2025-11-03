import { EquipmentServiceResponse } from '../types/equipment-service-response.type';
import { EquipmentServiceEntity } from '../../model/entities/equipment-service.entity';
import {EquipmentTypeMapper} from '../../../../shared/api/mappers/equipment-type.mapper';
import {ServiceStatusMapper} from './service-status.mapper';
import {ServiceTypeMapper} from '../../../../shared/api/mappers/service-type.mapper';

export class EquipmentServiceEntityFromResponseMapper {
  static fromDtoToEntity(dto: EquipmentServiceResponse): EquipmentServiceEntity {
    return {
      id: dto.id ?? '',
      operatorId: dto.operatorId ?? '',
      projectId: dto.projectId ?? '',
      equipmentId: dto.equipmentId ?? '',
      equipmentType: EquipmentTypeMapper.fromStringToEnum(dto.equipmentType ?? ''),
      status: ServiceStatusMapper.fromStringToEnum(dto.status ?? ''),
      supervisorId: dto.supervisorId ?? '',
      type: ServiceTypeMapper.fromStringToEnum(dto.type ?? ''),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(0),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(0),
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : null,
      totalWorkDuration: dto.totalWorkDuration ?? '',
      videoStartFileId: dto.videoStartFileId ?? '',
      videoEndFileId: dto.videoEndFileId ?? '',
      startPhotos: dto.startPhotos ?? [],
      midPhotos: dto.midPhotos ?? [],
      endPhotos: dto.endPhotos ?? [],
      reportDocumentFileId: dto.reportDocumentFileId ?? '',
    };
  }
}
