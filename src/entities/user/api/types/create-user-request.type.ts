export interface CreateUserRequestType {
  email: string | null;
  password: string | null;
  roles: string[] | null;
}
