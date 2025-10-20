import { PanelEntity } from '../model';
import { CreatePanelRequest } from './create-panel-request.type';

export class CreatePanelRequestFromEntityMapper {
  static fromEntityToDto(entity: PanelEntity): CreatePanelRequest {
    return {
      clientId: entity.clientId,
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      locationId: entity.locationId,
      referenceLocation: entity.referenceLocation,
      communicationProtocolId: entity.communicationProtocolId,
      panelTypeId: entity.panelTypeId,
    };
  }
}
