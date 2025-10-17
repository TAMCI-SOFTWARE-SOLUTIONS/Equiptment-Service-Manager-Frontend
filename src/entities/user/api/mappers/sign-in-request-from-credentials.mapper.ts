import {SignInRequest} from '../types/sign-in-request.type';

export interface SignInCredentials {
  email: string;
  password: string;
}

export class SignInRequestFromCredentialsMapper {
  static fromCredentialsToDto(credentials: SignInCredentials): SignInRequest {
    return {
      email: credentials.email,
      password: credentials.password
    };
  }
}
