import {inject, Injectable} from '@angular/core';
import {AuthStore, MyProfileStore} from '../../stores';
import {ContextStore} from '../../model/context.store';
import {EventBusService} from './event-bus.service';
import {EventNames} from '../../events/event-names';
import {
  AuthLoginPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  ContextChangedPayload,
  UserPreferenceLoadedPayload
} from '../../events/event-payloads';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private readonly authStore = inject(AuthStore);
  private readonly contextStore = inject(ContextStore);
  private readonly myProfileStore = inject(MyProfileStore);
  private readonly eventBus = inject(EventBusService);

  initializeApp(): Promise<void> {
    return new Promise(async (resolve) => {
      this.setupEventBusCommunication();

      await this.authStore.initializeAuth();

      if (this.authStore.isAuthenticated()) {
        await this.authStore.refreshUser();
      }

      resolve();
    });
  }

  private setupEventBusCommunication(): void {
    this.eventBus.on(EventNames.AUTH_LOGIN, (data: AuthLoginPayload) => {
      if (data.userId) {
        this.myProfileStore.loadProfile(data.userId).then();
      }
    });

    this.eventBus.on(EventNames.AUTH_REFRESH, (data: AuthRefreshPayload) => {
      if (data.userId) {
        this.myProfileStore.loadProfile(data.userId).then();
      }
    });

    this.eventBus.on(EventNames.AUTH_LOGOUT, (_: AuthLogoutPayload) => {
      this.myProfileStore.clearProfile();
      this.contextStore.clearContext();
    });

    this.eventBus.on(EventNames.USER_PREFERENCES_LOADED, (data: UserPreferenceLoadedPayload) => {
      if (data.userPreference.lastSelectedClientId && data.userPreference.lastSelectedProjectId) {
        this.contextStore.loadContext(
          data.userPreference.lastSelectedClientId,
          data.userPreference.lastSelectedProjectId
        ).then();
      }
    });

    this.eventBus.on(EventNames.CONTEXT_CHANGED, (data: ContextChangedPayload) => {
      if (data.clientId && data.projectId) {
        this.contextStore.loadContext(data.clientId, data.projectId).then();

        this.authStore.updateUserPreferences({
          lastSelectedClientId: data.clientId,
          lastSelectedProjectId: data.projectId
        }).then();
      }
    });
  }

/*  public notifyAuthChange(isAuthenticated: boolean, userId: string | null): void {
    if (isAuthenticated && userId) {
      const payload: AuthLoginPayload = {
        userId,
        timestamp: new Date()
      };
      this.eventBus.emit(EventNames.AUTH_LOGIN, payload);
    } else {
      const payload: AuthLogoutPayload = {
        reason: 'manual',
        userId,
        timestamp: new Date()
      };
      this.eventBus.emit(EventNames.AUTH_LOGOUT, payload);
    }
  }

  public getEventBus(): EventBusService {
    return this.eventBus;
  }*/
}
