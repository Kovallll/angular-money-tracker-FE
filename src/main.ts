// import { loadRemoteEntry, loadRemoteModule } from '@angular-architects/module-federation';
// Promise.all([loadRemoteEntry('http://localhost:3002/remoteEntry.js', 'mct')])
//   .then(() =>
//     loadRemoteModule({
//       type: 'script',
//       remoteName: 'mct',
//       exposedModule: './reactApp',
//     }),
//   )
//   .then(() => import('./bootstrap'));
import 'zone.js';
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter, withHashLocation } from '@angular/router';
import routeConfig from './app/routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ThemePreset } from './preset';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { baseApiUrlInterceptor } from './shared';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

const providers = [
  provideTanStackQuery(new QueryClient()),
  provideProtractorTestingSupport(),
  provideRouter(routeConfig, withHashLocation()),
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

export { providers };
