import { PanelEntity } from '../model';
import { CreatePanelRequest } from './create-panel-request.type';

/**
 * Mapper class for converting PanelEntity to CreatePanelRequest DTO
 * Used when creating a new panel
 */
export class CreatePanelRequestFromEntityMapper {

  /**
   * Converts a PanelEntity to CreatePanelRequest DTO
   *
   * @param entity The panel entity to convert
   * @returns CreatePanelRequest DTO
   */
  static fromEntityToDto(entity: PanelEntity): CreatePanelRequest {
    return {
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      locationId: entity.locationId,
      communicationProtocolId: entity.communicationProtocolId,
      panelTypeId: entity.panelTypeId,
    };
  }
}
