import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import routeConfig from './app/routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ThemePreset } from './preset';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { baseApiUrlInterceptor } from './shared';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

bootstrapApplication(AppComponent, {
  providers: [
    provideTanStackQuery(new QueryClient()),
    provideProtractorTestingSupport(),
    provideRouter(routeConfig),
    provideCharts(withDefaultRegisterables()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([baseApiUrlInterceptor])),
    providePrimeNG({
      theme: {
        preset: ThemePreset,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false,
        },
      },
    }),
  ],
}).catch((err) => console.error(err));
