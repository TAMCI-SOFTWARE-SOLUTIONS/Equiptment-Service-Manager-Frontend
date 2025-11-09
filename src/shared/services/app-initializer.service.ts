import {inject, Injectable} from '@angular/core';
import {AuthStore, MyProfileStore} from '../stores';
import {EventBusService} from './event-bus.service';
import {EventNames} from '../events/event-names';
import {AuthLoginPayload, AuthLogoutPayload, AuthRefreshPayload, ProfileUpdatedPayload} from '../events/event-payloads';
import {ContextStore} from '../model/context.store';

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
      console.log('🚀 Inicializando aplicación...');
      this.setupEventBusCommunication();

      await this.authStore.initializeAuth();
      console.log('✅ Auth state initialized');

      if (this.authStore.isAuthenticated()) {
        await this.authStore.refreshUser();
        console.log('✅ User data refreshed');
        this.initializeContextAfterAuth();
      }

      console.log('✅ App initialization complete');
      resolve();
    });
  }

  /*
  Here you can set up event listeners for events emitted by the EventBusService.
  When to use:
  - Only for complex orchestration logic involving multiple stores
  - For centralized logging (optional)
  - For initialization of global configurations
  */
  private setupEventBusCommunication(): void {
    this.eventBus.on(EventNames.PROFILE_UPDATED, (_: ProfileUpdatedPayload) => {
    });

    this.eventBus.on(EventNames.AUTH_LOGIN, (data: AuthLoginPayload) => {
      if (data.userId) {
        this.myProfileStore.loadProfile(data.userId).then();
        this.initializeContextAfterAuth();
      }
    });

    this.eventBus.on(EventNames.AUTH_REFRESH, (data: AuthRefreshPayload) => {
      if (data.userId) {this.myProfileStore.loadProfile(data.userId).then(() => {});}
    });

    this.eventBus.on(EventNames.AUTH_LOGOUT, (_: AuthLogoutPayload) => {
      this.myProfileStore.clearProfile();
      this.contextStore.clearContext();
    });
  }

  private initializeContextAfterAuth(): void {
    console.log('🔧 Initializing context after authentication...');

    const hasStoredContext = this.contextStore.loadFromStorage();

    if (!hasStoredContext) {
      console.log('No stored context, loading default client/project');
      this.contextStore.initializeForNewUser();
    } else {
      console.log('Context loaded from storage:', this.contextStore.contextSummary());
    }
  }

  public notifyAuthChange(isAuthenticated: boolean, userId: string | null): void {
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
  }
}
