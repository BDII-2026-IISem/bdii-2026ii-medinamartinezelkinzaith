import { Routes } from '@angular/router';
import { Getall } from './getall/getall';
import { Create } from './create/create';
import { Update } from './update/update';
import { Delete } from './delete/delete';

export const TRAINER_ROUTES: Routes = [
  { path: '', component: Getall },
  { path: 'new', component: Create },
  { path: 'edit/:id', component: Update },
  { path: 'delete/:id', component: Delete },
];
