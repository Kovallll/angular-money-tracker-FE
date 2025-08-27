import { Routes } from '@angular/router';

const routeConfig: Routes = [
  {
    path: '',
    loadComponent: () => import('./onboard/onboard').then((m) => m.OnboardPage),
    title: 'Onboarding',
  },
  //    { path: '404', component: Error404Component },
  //   { path: '**', redirectTo: '404' },
];
export default routeConfig;
