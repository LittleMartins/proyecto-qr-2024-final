import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TestFirebasePageRoutingModule } from './test-firebase-routing.module';
import { TestFirebasePage } from './test-firebase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestFirebasePageRoutingModule
  ],
  declarations: [TestFirebasePage]
})
export class TestFirebasePageModule {}