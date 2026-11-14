import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/api.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .shohin-split-left {
      background: linear-gradient(135deg, #1f2124 0%, #323539 55%, #6e0b14 100%);
      position: relative;
      overflow: hidden;
    }
    .shohin-wave-1 {
      position: absolute;
      width: 520px;
      height: 520px;
      border: 2px solid rgba(155, 17, 30, 0.45);
      border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
      top: -120px;
      left: -140px;
      transform: rotate(-15deg);
      pointer-events: none;
    }
    .shohin-wave-2 {
      position: absolute;
      width: 600px;
      height: 600px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 45% 55% 60% 40% / 50% 45% 55% 50%;
      bottom: -180px;
      right: -120px;
      pointer-events: none;
    }
    .shohin-dot-red {
      position: absolute;
      width: 44px;
      height: 44px;
      background-color: #9b111e;
      border-radius: 50% 50% 50% 12%;
      top: 14%;
      left: 14%;
    }
    .shohin-dot-gray {
      position: absolute;
      width: 26px;
      height: 26px;
      background-color: #7a7e85;
      border-radius: 50%;
      bottom: 16%;
      left: 10%;
    }
    .shohin-input {
      border: 1.5px solid #d0d5dd;
      border-radius: 8px;
      padding: 0.7rem 0.95rem;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }
    .shohin-input:focus {
      border-color: #9b111e;
      box-shadow: 0 0 0 3px rgba(155, 17, 30, 0.15);
      outline: none;
    }
    .btn-shohin-red {
      background-color: #9b111e;
      color: #ffffff;
      border: none;
      border-radius: 50px;
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: background-color 0.2s ease, transform 0.1s ease;
    }
    .btn-shohin-red:hover:not(:disabled) {
      background-color: #7c0d17;
      color: #ffffff;
      transform: translateY(-1px);
    }
    .btn-shohin-role {
      border-radius: 50px;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.95rem;
      transition: all 0.2s;
    }
  `],
  template: `
    <div class="container-fluid p-0 min-vh-100">
      <div class="row g-0 min-vh-100">

        <!-- COLUMNA IZQUIERDA: ESTILO CISCO / SALESKIP CON COLORES SHOHÍN -->
        <div class="col-lg-7 d-none d-lg-flex flex-column justify-content-between p-5 text-white shohin-split-left">
          <div class="shohin-wave-1"></div>
          <div class="shohin-wave-2"></div>
          <div class="shohin-dot-red"></div>
          <div class="shohin-dot-gray"></div>

          <!-- Top Strip Izquierdo -->
          <div class="position-relative z-1 d-flex align-items-center gap-2">
            <span class="badge rounded-pill px-3 py-2" style="background-color: #9b111e; letter-spacing: 0.5px;">
              SHOHÍN DIGITAL · CAPACITALAB IA
            </span>
          </div>

          <!-- Texto Central Estilo Cisco Networking Academy -->
          <div class="position-relative z-1 my-auto px-4" style="max-width: 620px;">
            <div class="text-uppercase fw-bold small mb-2" style="color: #e05260; letter-spacing: 1.5px;">
              Shohín · Terminal de Carga Aérea
            </div>
            <h1 class="display-4 fw-bold mb-4" style="line-height: 1.15;">
              Desarrolle sus habilidades con SHOHÍN
            </h1>
            <p class="fs-5 text-light opacity-75 mb-4" style="line-height: 1.6;">
              Siga trayectorias de formación corporativa y seguridad aeroportuaria asistidas por Inteligencia Artificial, con evaluación automatizada en tiempo real.
            </p>
            <div class="d-flex gap-4 pt-2 small text-light opacity-75">
              <div><i class="bi bi-shield-check text-danger me-2"></i>Seguridad JWT HS256</div>
              <div><i class="bi bi-cpu text-danger me-2"></i>Cursos generados con IA</div>
              <div><i class="bi bi-patch-check text-danger me-2"></i>Calificación inmediata</div>
            </div>
          </div>

          <!-- Footer Izquierdo Estilo SaleSkip -->
          <div class="position-relative z-1 small text-light opacity-50 px-4">
            © 2026 SHOHÍN S.A. · Terminal de Carga Aérea · Plataforma Cloud UPN. Todos los derechos reservados.
          </div>
        </div>

        <!-- COLUMNA DERECHA: FORMULARIO BLANCO LIMPIO ESTILO CISCO + LOGO SHOHÍN -->
        <div class="col-lg-5 col-12 bg-white d-flex flex-column justify-content-between p-4 p-md-5">

          <!-- Cabecera Derecha: Idioma estilo Cisco -->
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-muted fw-semibold">PORTAL CORPORATIVO</span>
            <span class="border rounded-pill px-3 py-1 small text-secondary d-inline-flex align-items-center gap-1">
              <i class="bi bi-globe2"></i> Español / Inglés
            </span>
          </div>

          <!-- Bloque Central del Login -->
          <div class="my-auto mx-auto w-100" style="max-width: 400px;">

            <!-- LOGO OFICIAL SHOHÍN (SVG fiel a la imagen) -->
            <div class="d-flex align-items-center mb-4 pb-2">
              <svg width="56" height="42" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="me-2">
                <!-- Rombo izquierdo rojo Shohín -->
                <path d="M22 6L38 24L22 42L6 24L22 6Z" stroke="#9B111E" stroke-width="5.5" stroke-linejoin="round"/>
                <!-- Chevron derecho rojo Shohín -->
                <path d="M36 6L52 24L36 42" stroke="#9B111E" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div>
                <div class="fw-bolder" style="font-size: 1.9rem; line-height: 1; color: #7a7e85; letter-spacing: 1px;">
                  SHOHÍN
                </div>
                <div class="fw-bold text-uppercase" style="font-size: 0.62rem; color: #9b111e; letter-spacing: 1.2px;">
                  TERMINAL DE CARGA AÉREA
                </div>
              </div>
            </div>

            <!-- Bienvenida Estilo Cisco -->
            <h2 class="fw-bold mb-1" style="color: #232528;">¡Le damos la bienvenida!</h2>
            <p class="text-secondary small mb-4">Inicie sesión en su cuenta de capacitación corporativa</p>

            @if (errorMsg()) {
              <div class="alert alert-danger d-flex align-items-center py-2 small rounded-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMsg() }}</div>
              </div>
            }

            <form (ngSubmit)="iniciarSesion()">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-secondary mb-1">
                  Correo electrónico corporativo <span class="text-danger">*</span>
                </label>
                <input type="email"
                       class="form-control shohin-input"
                       name="email"
                       [(ngModel)]="credenciales.email"
                       placeholder="usuario@upn.edu.pe"
                       required>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-semibold text-secondary mb-1">
                  Contraseña <span class="text-danger">*</span>
                </label>
                <input type="password"
                       class="form-control shohin-input"
                       name="password"
                       [(ngModel)]="credenciales.password"
                       placeholder="Ingrese su contraseña"
                       required>
              </div>

              <div class="d-grid mb-4">
                <button type="submit"
                        class="btn btn-shohin-red"
                        [disabled]="cargando()">
                  @if (cargando()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>Autenticando...
                  } @else {
                    Iniciar sesión
                  }
                </button>
              </div>
            </form>

            <!-- Separador "O continúe con" estilo Cisco -->
            <div class="d-flex align-items-center my-3">
              <div class="flex-grow-1 border-bottom"></div>
              <span class="px-3 text-muted small">Acceso rápido por Rol (Demo JWT)</span>
              <div class="flex-grow-1 border-bottom"></div>
            </div>

            <div class="d-flex gap-2 justify-content-between mt-3">
              <button type="button"
                      class="btn btn-shohin-role flex-fill"
                      style="background-color: #9b111e; color: white;"
                      (click)="usarDemo('admin@upn.edu.pe')">
                <i class="bi bi-shield-lock me-1"></i>ADMIN
              </button>
              <button type="button"
                      class="btn btn-shohin-role flex-fill"
                      style="background-color: #4a4d50; color: white;"
                      (click)="usarDemo('creador@upn.edu.pe')">
                <i class="bi bi-easel me-1"></i>CREADOR
              </button>
              <button type="button"
                      class="btn btn-shohin-role flex-fill border"
                      style="background-color: #f4f6f9; color: #3c3f42;"
                      (click)="usarDemo('alumno@upn.edu.pe')">
                <i class="bi bi-person-check me-1"></i>ALUMNO
              </button>
            </div>

          </div>

          <!-- Footer Derecho -->
          <div class="text-center text-muted small pt-3 border-top">
            Protegido con <strong>Spring Security 6 + OAuth2 JWT</strong> · Grupo 9 UPN
          </div>

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credenciales: LoginRequest = {
    email: '',
    password: ''
  };

  cargando = signal(false);
  errorMsg = signal('');

  usarDemo(email: string): void {
    this.credenciales.email = email;
    this.credenciales.password = 'Upn2026*';
    this.errorMsg.set('');
  }

  iniciarSesion(): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.authService.login(this.credenciales).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/capacitaciones']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMsg.set(err.error?.message || 'Error al conectar con el servidor Backend (puerto 8088)');
      }
    });
  }
}