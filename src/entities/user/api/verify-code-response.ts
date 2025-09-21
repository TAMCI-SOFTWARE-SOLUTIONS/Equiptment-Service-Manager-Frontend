export interface VerifyCodeResponse {
  id: string | null;
  username: string | null;
  email: string | null;
  status: string | null;
  roles: string[] | null;
}
