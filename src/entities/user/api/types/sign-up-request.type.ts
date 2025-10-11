export interface SignUpRequest {
  username: string | null;
  password: string | null;
  roles: string[] | null;
}
