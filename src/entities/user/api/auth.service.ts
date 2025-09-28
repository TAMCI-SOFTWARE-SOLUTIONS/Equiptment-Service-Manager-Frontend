import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {BaseService} from '../../../shared/api';
import {RequestCodeResponse} from './request-code-response';
import {VerifyCodeResponse} from './verify-code-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'auth';
  }

  requestCode(email: string): Observable<RequestCodeResponse> {
    return this.http.post<RequestCodeResponse>(`${this.resourcePath()}/request-code?email=${email}`, this.httpOptions);
  }

  verifyCode(email: string, code: string): Observable<VerifyCodeResponse> {
    return this.http.post<VerifyCodeResponse>(`${this.resourcePath()}/verify-code?email=${email}&code=${code}`, this.httpOptions);
  }
}
