import { CommunicationProtocolEntity } from '../../model';
import { CreateCommunicationProtocolRequest } from '../types/create-communication-protocol-request.type';

export class CreateCommunicationProtocolRequestFromEntityMapper {
  static fromEntityToDto(entity: CommunicationProtocolEntity): CreateCommunicationProtocolRequest {
    return {
      name: entity.name,
    };
  }
}
