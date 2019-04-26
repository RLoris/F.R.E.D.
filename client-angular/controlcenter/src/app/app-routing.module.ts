import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverlayComponent } from './overlay/overlay.component';

const routes: Routes = [
  { path: 'home', component : OverlayComponent},
  { path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
