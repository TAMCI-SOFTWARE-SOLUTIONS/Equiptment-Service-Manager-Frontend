export interface RequestCodeResponse {
  email: string | null;
  expiresAt: string | null;
  blockedAt: string | null;
  attemptsRemaining: number | null;
}
