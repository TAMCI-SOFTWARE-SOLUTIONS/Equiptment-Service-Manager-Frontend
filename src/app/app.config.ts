import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';
import { authenticationInterceptor } from '../shared/api';
import { AppInitializerService } from '../shared/services';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const BlueModern = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: BlueModern,
        options: {
          prefix: 'p',
          darkModeSelector: 'light',
          cssLayer: false
        }
      }
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitializer: AppInitializerService) => () => appInitializer.initializeApp(),
      deps: [AppInitializerService],
      multi: true
    }, provideCharts(withDefaultRegisterables())
  ]
};
