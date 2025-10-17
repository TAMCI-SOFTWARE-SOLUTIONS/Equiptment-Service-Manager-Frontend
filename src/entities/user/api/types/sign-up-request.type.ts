export interface SignUpRequest {
  email: string | null;
  password: string | null;
  roles: string[] | null;
}
