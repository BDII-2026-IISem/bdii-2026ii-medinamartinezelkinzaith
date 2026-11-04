import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { provideRouter,withComponentInputBinding,
  withInMemoryScrolling,} from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes ,withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),),
    providePrimeNG({
      license: environment.primeUiLicense || undefined,
      ripple: true,
      inputVariant: 'outlined',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, utilities' },
        },
      },
    }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    MessageService,
    ConfirmationService,
  ],
};


