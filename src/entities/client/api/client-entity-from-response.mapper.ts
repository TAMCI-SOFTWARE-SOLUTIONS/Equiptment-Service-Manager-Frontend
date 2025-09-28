import {ClientResponseDto} from './client-response.dto';
import {ClientEntity} from '../model';

export class ClientEntityFromResponseMapper {
  static fromDtoToEntity(dto: ClientResponseDto): ClientEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      logoFileId: dto.logoFileId,
      bannerFileId: dto.bannerFileId,
    }
  }
}
