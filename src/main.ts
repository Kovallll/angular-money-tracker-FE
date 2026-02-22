import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter, withHashLocation } from '@angular/router';
import routeConfig from './app/routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ThemePreset } from './preset';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor, baseApiUrlInterceptor } from './shared';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { APP_INITIALIZER, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { ExchangeRatesService } from './shared/services/currency/exchange-rates.service';

const providers = [
  {
    provide: APP_INITIALIZER,
    useFactory: (exchangeRates: ExchangeRatesService) => () => exchangeRates.loadRates(),
    deps: [ExchangeRatesService],
    multi: true,
  },
  provideTanStackQuery(new QueryClient()),
  provideProtractorTestingSupport(),
  provideRouter(routeConfig, withHashLocation()),
  provideCharts(withDefaultRegisterables()),
  provideAnimationsAsync(),
  provideHttpClient(withFetch(), withInterceptors([baseApiUrlInterceptor, authInterceptor])),
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
];

bootstrapApplication(AppComponent, {
  providers: [
    ...providers,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch((err) => console.error(err));
