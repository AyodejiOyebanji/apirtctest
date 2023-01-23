import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { VideoSectionComponent } from './video-section/video-section.component';


const routes: Routes = [
   {path:"", component:HomeComponent, title:"home"},
  {path:"video", component:VideoSectionComponent, title:"video section"},
  {path:"login", component:LoginComponent,}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
