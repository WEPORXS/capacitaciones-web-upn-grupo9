import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { CapacitacionesComponent } from './pages/capacitaciones/capacitaciones.component';
import { EvaluacionesComponent } from './pages/evaluaciones/evaluaciones.component';
import { PerfilesComponent } from './pages/perfiles/perfiles.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'capacitaciones', component: CapacitacionesComponent, canActivate: [authGuard] },
  { path: 'evaluaciones', component: EvaluacionesComponent, canActivate: [authGuard] },
  { path: 'perfiles', component: PerfilesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'capacitaciones', pathMatch: 'full' },
  { path: '**', redirectTo: 'capacitaciones' }
];