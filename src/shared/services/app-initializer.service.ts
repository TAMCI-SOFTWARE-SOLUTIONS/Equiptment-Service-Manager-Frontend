import {inject, Injectable} from '@angular/core';
import {AuthStore} from '../stores';
import {EventBusService} from './event-bus.service';
import {EventNames} from '../events/event-names';
import {AuthLoginPayload, AuthLogoutPayload, ProfileUpdatedPayload} from '../events/event-payloads';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private readonly authStore = inject(AuthStore);
  private readonly eventBus = inject(EventBusService);

  initializeApp(): Promise<void> {
    return new Promise(async (resolve) => {
      console.log('🚀 Inicializando aplicación...');
      this.setupEventBusCommunication();

      this.authStore.initializeAuth();
      console.log('✅ Auth state initialized');

      if (this.authStore.isAuthenticated()) {
        await this.authStore.refreshUser();
        console.log('✅ User data refreshed');
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
