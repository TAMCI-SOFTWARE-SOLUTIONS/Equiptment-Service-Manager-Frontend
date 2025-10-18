import { CommunicationProtocolEntity } from '../../model';
import {UpdateCommunicationProtocolRequest} from '../types/update-communication-protocol-request.type';

export class CreateCommunicationProtocolRequestFromEntityMapper {
  static fromEntityToDto(entity: CommunicationProtocolEntity): UpdateCommunicationProtocolRequest {
    return {
      name: entity.name,
    };
  }
}
