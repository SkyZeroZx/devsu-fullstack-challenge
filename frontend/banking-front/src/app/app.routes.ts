import { Route } from '@angular/router';
import { authGuard, publicGuard } from '@core/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('@app/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('@app/pages/ui-demo/ui-demo.component').then(
        (m) => m.UiDemoComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/layout/content/content.component').then(
        (m) => m.ContentComponent,
      ),
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      {
        path: 'clientes',
        loadComponent: () =>
          import('@app/pages/clients/clients.component').then(
            (m) => m.ClientsComponent,
          ),
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('@app/pages/clients/create/client-create.component').then(
            (m) => m.ClientCreateComponent,
          ),
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () =>
          import('@app/pages/clients/edit/client-edit.component').then(
            (m) => m.ClientEditComponent,
          ),
      },
      {
        path: 'cuentas',
        loadComponent: () =>
          import('@app/pages/accounts/accounts.component').then(
            (m) => m.AccountsComponent,
          ),
      },
      {
        path: 'cuentas/nuevo',
        loadComponent: () =>
          import('@app/pages/accounts/create/account-create.component').then(
            (m) => m.AccountCreateComponent,
          ),
      },
      {
        path: 'cuentas/:id/editar',
        loadComponent: () =>
          import('@app/pages/accounts/edit/account-edit.component').then(
            (m) => m.AccountEditComponent,
          ),
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('@app/pages/movements/movements.component').then(
            (m) => m.MovementsComponent,
          ),
      },
      {
        path: 'movimientos/nuevo',
        loadComponent: () =>
          import('@app/pages/movements/create/movement-create.component').then(
            (m) => m.MovementCreateComponent,
          ),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('@app/pages/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
