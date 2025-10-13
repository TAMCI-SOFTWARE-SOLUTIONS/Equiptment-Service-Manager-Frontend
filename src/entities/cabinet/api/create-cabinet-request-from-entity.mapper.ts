import { CabinetEntity } from '../model';
import { CreateCabinetRequest } from './create-cabinet-request.type';

export class CreateCabinetRequestFromEntityMapper {

  static fromEntityToDto(entity: CabinetEntity): CreateCabinetRequest {
    return {
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      communicationProtocolId: entity.communicationProtocolId,
      cabinetTypeId: entity.cabinetTypeId,
      locationId: entity.locationId
    };
  }
}
