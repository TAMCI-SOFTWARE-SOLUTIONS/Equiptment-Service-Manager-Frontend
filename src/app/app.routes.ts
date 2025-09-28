import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'clients', title: 'Select Client', loadComponent: () => import('../page/select-client/ui').then(m => m.SelectClientPage) },
  { path: 'clients/:clientId/projects', title: 'Select Project', loadComponent: () => import('../page/select-project/ui').then(m => m.SelectProjectPage)},
  { path: 'projects/:projectId/services', title: 'Project Dashboard', loadComponent: () => import('../page/select-service/ui').then(m => m.SelectServicePage) },
  { path: 'projects/:projectId/equipments', title: 'Select Equipment', loadComponent: () => import('../page/select-equipment/ui').then(m => m.SelectEquipmentPage) },
];
