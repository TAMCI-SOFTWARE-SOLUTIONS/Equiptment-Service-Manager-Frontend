import { ProfileEntity } from '../../entities/profile';
import { UserEntity } from '../../entities/user/model';
import { EventNames } from './event-names';

/**
 * Payload base para todos los eventos
 */
export interface BaseEventPayload {
  timestamp?: Date;
}

/**
 * Evento: Usuario inició sesión exitosamente
 */
export interface AuthLoginPayload extends BaseEventPayload {
  userId: string;
  user?: UserEntity;
  token?: string;
}

/**
 * Evento: Usuario cerró sesión
 */
export interface AuthLogoutPayload extends BaseEventPayload {
  reason?: 'manual' | 'token_expired' | 'error';
  userId?: string | null;
}

/**
 * Evento: Token expirado
 */
export interface AuthTokenExpiredPayload extends BaseEventPayload {
  userId: string | null;
  message?: string;
}

/**
 * Evento: Sesión restaurada desde storage (refresh página)
 */
export interface AuthRestoredPayload extends BaseEventPayload {
  userId: string;
  token: string;
  user?: UserEntity;
}

/**
 * Evento: Usuario actualizado/refrescado
 */
export interface AuthRefreshPayload extends BaseEventPayload {
  userId: string;
  user: UserEntity;
  token: string;
}

/**
 * Evento: Perfil actualizado
 */
export interface ProfileUpdatedPayload extends BaseEventPayload {
  userId: string;
  profile: ProfileEntity;
}

/**
 * Evento: Imagen de perfil actualizada
 */
export interface ProfileImageUpdatedPayload extends BaseEventPayload {
  userId?: string;
  imageUrl?: string | null;
}

/**
 * Evento: Perfil limpiado
 */
export interface ProfileClearedPayload extends BaseEventPayload {
  reason?: string;
}

/**
 * Evento: Contexto cambiado
 */
export interface ContextChangedPayload extends BaseEventPayload {
  clientId?: string;
  projectId?: string;
}

/**
 * Evento: Notificación mostrada
 */
export interface NotificationPayload extends BaseEventPayload {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

/**
 * Mapa de tipos de eventos
 * Relaciona cada nombre de evento con su payload correspondiente
 */
export interface EventPayloadMap {
  [EventNames.AUTH_LOGIN]: AuthLoginPayload;
  [EventNames.AUTH_LOGOUT]: AuthLogoutPayload;
  [EventNames.AUTH_TOKEN_EXPIRED]: AuthTokenExpiredPayload;
  [EventNames.AUTH_RESTORED]: AuthRestoredPayload;
  [EventNames.AUTH_REFRESH]: AuthRefreshPayload;
  [EventNames.PROFILE_UPDATED]: ProfileUpdatedPayload;
  [EventNames.PROFILE_IMAGE_UPDATED]: ProfileImageUpdatedPayload;
  [EventNames.PROFILE_CLEARED]: ProfileClearedPayload;
  [EventNames.CONTEXT_CHANGED]: ContextChangedPayload;
  [EventNames.NOTIFICATION_SHOW]: NotificationPayload;
}
