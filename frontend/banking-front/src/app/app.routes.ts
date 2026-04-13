import { Route } from '@angular/router';
import { authGuard, publicGuard } from '@core/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [publicGuard],
    title: 'Banking Frontend | Login',
    loadComponent: () =>
      import('@app/pages/login/login.component').then((m) => m.LoginComponent),
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
        title: 'Banking Frontend | Clientes',
        loadComponent: () =>
          import('@app/pages/clients/clients.component').then(
            (m) => m.ClientsComponent,
          ),
      },
      {
        path: 'clientes/nuevo',
        title: 'Banking Frontend | Nuevo Cliente',
        loadComponent: () =>
          import('@app/pages/clients/create/client-create.component').then(
            (m) => m.ClientCreateComponent,
          ),
      },
      {
        path: 'clientes/:id/editar',
        title: 'Banking Frontend | Editar Cliente',
        loadComponent: () =>
          import('@app/pages/clients/edit/client-edit.component').then(
            (m) => m.ClientEditComponent,
          ),
      },
      {
        path: 'cuentas',
        title: 'Banking Frontend | Cuentas',
        loadComponent: () =>
          import('@app/pages/accounts/accounts.component').then(
            (m) => m.AccountsComponent,
          ),
      },
      {
        path: 'cuentas/nuevo',
        title: 'Banking Frontend | Nueva Cuenta',
        loadComponent: () =>
          import('@app/pages/accounts/create/account-create.component').then(
            (m) => m.AccountCreateComponent,
          ),
      },
      {
        path: 'cuentas/:id/editar',
        title: 'Banking Frontend | Editar Cuenta',
        loadComponent: () =>
          import('@app/pages/accounts/edit/account-edit.component').then(
            (m) => m.AccountEditComponent,
          ),
      },
      {
        path: 'movimientos',
        title: 'Banking Frontend | Movimientos',
        loadComponent: () =>
          import('@app/pages/movements/movements.component').then(
            (m) => m.MovementsComponent,
          ),
      },
      {
        path: 'movimientos/nuevo',
        title: 'Banking Frontend | Nuevo Movimiento',
        loadComponent: () =>
          import('@app/pages/movements/create/movement-create.component').then(
            (m) => m.MovementCreateComponent,
          ),
      },
      {
        path: 'reportes',
        title: 'Banking Frontend | Reportes',
        loadComponent: () =>
          import('@app/pages/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
