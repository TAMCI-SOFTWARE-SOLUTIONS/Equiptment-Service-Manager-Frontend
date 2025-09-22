import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'clients', title: 'Select Client', loadComponent: () => import('../page/select-client/ui').then(m => m.SelectClientPage) },
];
