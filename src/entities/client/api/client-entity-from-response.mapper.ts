import {ClientEntity} from '../model';
import {ClientResponse} from './client-response.type';

export class ClientEntityFromResponseMapper {
  static fromDtoToEntity(dto: ClientResponse): ClientEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      logoFileId: dto.logoFileId,
      bannerFileId: dto.bannerFileId,
    }
  }
}
