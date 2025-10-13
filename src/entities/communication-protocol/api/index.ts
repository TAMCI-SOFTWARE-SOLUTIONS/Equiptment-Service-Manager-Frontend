import {
  CommunicationProtocolEntityFromResponseMapper
} from './mappers/communication-protocol-entity-from-response.mapper';
import {
  CreateCommunicationProtocolRequestFromEntityMapper
} from './mappers/create-communication-protocol-request-from-entity.mapper';
import {CommunicationProtocolService} from './services/communication-protocol.service';
import {CommunicationProtocolResponse} from './types/communication-protocol-response.type';
import {CreateCommunicationProtocolRequest} from './types/create-communication-protocol-request.type';

export { CommunicationProtocolEntityFromResponseMapper, CreateCommunicationProtocolRequestFromEntityMapper, CommunicationProtocolService };
export type { CommunicationProtocolResponse, CreateCommunicationProtocolRequest };
