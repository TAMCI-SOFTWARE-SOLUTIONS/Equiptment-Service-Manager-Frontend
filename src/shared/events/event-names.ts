export class EventNames {
  // Eventos de autenticación
  static readonly AUTH_LOGIN = 'auth:login' as const;
  static readonly AUTH_LOGOUT = 'auth:logout' as const;
  static readonly AUTH_TOKEN_EXPIRED = 'auth:token_expired' as const;
  static readonly AUTH_RESTORED = 'auth:restored' as const;
  static readonly AUTH_REFRESH = 'auth:refresh' as const;

  // Eventos de perfil
  static readonly PROFILE_UPDATED = 'profile:updated' as const;
  static readonly PROFILE_IMAGE_UPDATED = 'profile:image_updated' as const;
  static readonly PROFILE_CLEARED = 'profile:cleared' as const;
  static readonly PROFILE_LOADING = 'profile:loading' as const;

  // Eventos de contexto
  static readonly CONTEXT_CHANGED = 'context:changed' as const;
  static readonly CONTEXT_CLEARED = 'context:cleared' as const;

  // Eventos de notificaciones
  static readonly NOTIFICATION_SHOW = 'notification:show' as const;
  static readonly NOTIFICATION_CLEAR = 'notification:clear' as const;
}
