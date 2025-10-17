export interface UserResponse {
  id: string | null;
  email: string | null;
  status: string | null;
  failedLoginAttempts: number | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  roles: string[] | null;
}
