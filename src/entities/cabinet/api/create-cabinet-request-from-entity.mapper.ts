import { CabinetEntity } from '../model';
import { CreateCabinetRequest } from './create-cabinet-request.type';

/**
 * Mapper class for converting CabinetEntity to CreateCabinetRequest DTO
 * Used when creating a new cabinet
 */
export class CreateCabinetRequestFromEntityMapper {

  /**
   * Converts a CabinetEntity to CreateCabinetRequest DTO
   *
   * @param entity The cabinet entity to convert
   * @returns CreateCabinetRequest DTO
   */
  static fromEntityToDto(entity: CabinetEntity): CreateCabinetRequest {
    return {
      plantId: entity.plantId,
      tag: entity.tag,
      areaId: entity.areaId,
      communicationProtocol: entity.communicationProtocol,
      cabinetType: entity.cabinetType,
      location: entity.location
    };
  }
}
