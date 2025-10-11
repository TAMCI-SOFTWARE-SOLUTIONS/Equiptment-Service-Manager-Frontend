import {SignInRequest} from '../types/sign-in-request.type';

export interface SignInCredentials {
  username: string;
  password: string;
}

export class SignInRequestFromCredentialsMapper {
  static fromCredentialsToDto(credentials: SignInCredentials): SignInRequest {
    return {
      username: credentials.username,
      password: credentials.password
    };
  }
}
