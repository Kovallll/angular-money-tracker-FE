import { loadRemoteEntry, loadRemoteModule } from '@angular-architects/module-federation';
Promise.all([loadRemoteEntry('http://localhost:3002/remoteEntry.js', 'mct')])
  .then(() =>
    loadRemoteModule({
      type: 'script',
      remoteName: 'mct',
      exposedModule: './reactApp',
    }),
  )
  .then(() => import('./bootstrap'));
