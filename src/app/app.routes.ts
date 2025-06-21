import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { BoardsComponent } from './components/boards/boards.component';
import { BoardComponent } from './components/board/board.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent }, // 👈 removed canActivate
  { path: 'boards', component: BoardsComponent },
  { path: 'board/:id', component: BoardComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

