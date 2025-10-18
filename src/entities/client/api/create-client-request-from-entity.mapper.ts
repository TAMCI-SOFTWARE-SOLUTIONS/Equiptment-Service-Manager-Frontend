import {ClientEntity} from '../model';
import {CreateClientRequest} from './create-client-request.type';

export class CreateClientRequestFromEntityMapper {
  static fromEntityToDto(entity: ClientEntity): CreateClientRequest {
    return {
      name: entity.name,
      logoFileId: entity.logoFileId,
      bannerFileId: entity.bannerFileId,
    };
  }
}
