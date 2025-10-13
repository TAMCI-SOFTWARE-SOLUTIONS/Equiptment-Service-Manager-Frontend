import { CommunicationProtocolResponse } from '../types/communication-protocol-response.type';
import { CommunicationProtocolEntity } from '../../model';

export class CommunicationProtocolEntityFromResponseMapper {
  static fromDtoToEntity(dto: CommunicationProtocolResponse): CommunicationProtocolEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
    };
  }
}
