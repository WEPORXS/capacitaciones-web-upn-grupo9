import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PerfilUsuario } from '../../core/models/api.models';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0"><i class="bi bi-people-fill text-danger me-2"></i>Gestión de Usuarios y Roles (ADMIN)</h3>
          <p class="text-muted small mb-0">Control de acceso RBAC y políticas de contraseñas seguras (BCrypt)</p>
        </div>
      </div>

      @if (mensajeExito()) {
        <div class="alert alert-success py-2">{{ mensajeExito() }}</div>
      }
      @if (mensajeError()) {
        <div class="alert alert-danger py-2">{{ mensajeError() }}</div>
      }

      <!-- Formulario de Nuevo Usuario -->
      <div class="card shadow-sm border-0 rounded-4 mb-4">
        <div class="card-header bg-dark text-white py-3 rounded-top-4">
          <h6 class="mb-0 fw-bold"><i class="bi bi-person-plus-fill me-2"></i>Registrar Nuevo Perfil de Usuario</h6>
        </div>
        <div class="card-body p-4">
          <form (ngSubmit)="guardarPerfil()">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Nombre Completo</label>
                <input type="text" class="form-control" name="nombreCompleto" [(ngModel)]="nuevoPerfil.nombreCompleto" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Correo Corporativo</label>
                <input type="email" class="form-control" name="email" [(ngModel)]="nuevoPerfil.email" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Contraseña (PasswordPolicy)</label>
                <input type="password" class="form-control" name="password" [(ngModel)]="nuevoPerfil.password"
                       placeholder="Mín. 8 car., Mayús, Minús, Núm, Esp." required>
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Rol</label>
                <select class="form-select" name="rol" [(ngModel)]="nuevoPerfil.rol">
                  <option value="ALUMNO">ALUMNO</option>
                  <option value="CREADOR">CREADOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div class="col-md-1">
                <button type="submit" class="btn btn-danger w-100 fw-semibold">Crear</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">ID</th>
                <th>Nombre Completo</th>
                <th>Correo</th>
                <th>Rol del Sistema</th>
                <th>Estado</th>
                <th class="text-end pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (u of perfiles(); track u.perfilId) {
                <tr>
                  <td class="ps-4 text-muted">#{{ u.perfilId }}</td>
                  <td class="fw-bold">{{ u.nombreCompleto }}</td>
                  <td>{{ u.email }}</td>
                  <td><span class="badge bg-secondary">{{ u.rol }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="u.activo ? 'bg-success' : 'bg-danger'">
                      {{ u.activo ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    @if (u.activo) {
                      <button class="btn btn-sm btn-outline-danger" (click)="darBaja(u.perfilId!)">
                        Dar de Baja
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PerfilesComponent implements OnInit {
  private apiService = inject(ApiService);

  perfiles = signal<PerfilUsuario[]>([]);
  mensajeExito = signal('');
  mensajeError = signal('');

  nuevoPerfil: PerfilUsuario = {
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'ALUMNO',
    activo: true
  };

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(): void {
    this.apiService.listarPerfiles().subscribe({
      next: (lista) => this.perfiles.set(lista),
      error: (err) => this.mensajeError.set(err.error?.message || 'Acceso restringido solo para rol ADMIN')
    });
  }

  guardarPerfil(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    this.apiService.crearPerfil(this.nuevoPerfil).subscribe({
      next: () => {
        this.mensajeExito.set('Usuario registrado con contraseña cifrada BCrypt');
        this.nuevoPerfil = { nombreCompleto: '', email: '', password: '', rol: 'ALUMNO', activo: true };
        this.cargarPerfiles();
      },
      error: (err) => this.mensajeError.set(err.error?.message || 'Error al registrar usuario')
    });
  }

  darBaja(id: number): void {
    this.apiService.eliminarPerfil(id).subscribe({
      next: () => this.cargarPerfiles()
    });
  }
}