import { PanelEntity } from '../model';
import {UpdatePanelRequest} from './update-panel-request.type';

export class UpdatePanelRequestFromEntityMapper {
  static fromEntityToDto(entity: PanelEntity): UpdatePanelRequest {
    return {
      panelId: entity.id,
      clientId: entity.clientId,
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      locationId: entity.locationId,
      communicationProtocolId: entity.communicationProtocolId,
      panelTypeId: entity.panelTypeId,
    };
  }
}
