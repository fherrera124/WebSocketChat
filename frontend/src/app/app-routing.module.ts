import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { IsLoggedGuard } from './guards/is-logged.guard';

const routes: Routes = [
  { path: "", redirectTo: "/chat", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "chat", component: ChatComponent, canActivate: [() => inject(IsLoggedGuard).canActivate()]},
  { path: "**", redirectTo: "chat"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
