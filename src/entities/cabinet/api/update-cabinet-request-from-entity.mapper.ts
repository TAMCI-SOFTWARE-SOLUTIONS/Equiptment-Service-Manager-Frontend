import { CabinetEntity } from '../model';
import {UpdateCabinetRequest} from './update-cabinet-request.type';

export class UpdateCabinetRequestFromEntityMapper {

  static fromEntityToDto(entity: CabinetEntity): UpdateCabinetRequest {
    return {
      cabinetId: entity.id,
      clientId: entity.clientId,
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      communicationProtocolId: entity.communicationProtocolId,
      cabinetTypeId: entity.cabinetTypeId,
      locationId: entity.locationId,
      referenceLocation: entity.referenceLocation,
    };
  }
}
