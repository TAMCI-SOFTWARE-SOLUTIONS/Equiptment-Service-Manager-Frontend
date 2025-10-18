import {ClientEntity} from '../model';
import {UpdateClientRequest} from './update-client.request';

export class UpdateClientRequestFromEntityMapper {
  static fromEntityToDto(entity: ClientEntity): UpdateClientRequest {
    return {
      name: entity.name,
      logoFileId: entity.logoFileId,
      bannerFileId: entity.bannerFileId,
    };
  }
}
