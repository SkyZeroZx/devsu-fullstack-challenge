import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'demo',
    loadComponent: () =>
      import('@app/pages/ui-demo/ui-demo.component').then(
        (m) => m.UiDemoComponent,
      ),
  },
];
