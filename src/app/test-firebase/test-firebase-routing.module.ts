import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestFirebasePage } from './test-firebase.page';

const routes: Routes = [
  {
    path: '',
    component: TestFirebasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestFirebasePageRoutingModule {}
