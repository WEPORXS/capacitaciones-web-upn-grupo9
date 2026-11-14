import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Capacitacion, Pregunta } from '../../core/models/api.models';

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">

      <!-- Cabecera y KPIs -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 class="fw-bold mb-0"><i class="bi bi-mortarboard-fill text-primary me-2"></i>Catálogo de Capacitaciones con IA</h3>
          <p class="text-muted small mb-0">Gestión de cursos, estado de publicación y banco de preguntas</p>
        </div>
        @if (authService.hasRole('ADMIN', 'CREADOR')) {
          <button class="btn btn-primary fw-semibold" (click)="abrirFormularioNuevo()">
            <i class="bi bi-plus-lg me-1"></i>Nueva Capacitación
          </button>
        }
      </div>

      <!-- Alertas de éxito o error del Backend -->
      @if (mensajeExito()) {
        <div class="alert alert-success alert-dismissible fade show py-2" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>{{ mensajeExito() }}
          <button type="button" class="btn-close py-2" (click)="mensajeExito.set('')"></button>
        </div>
      }
      @if (mensajeError()) {
        <div class="alert alert-danger alert-dismissible fade show py-2" role="alert">
          <i class="bi bi-exclamation-octagon-fill me-2"></i>{{ mensajeError() }}
          <button type="button" class="btn-close py-2" (click)="mensajeError.set('')"></button>
        </div>
      }

      <!-- Formulario Crear / Editar Capacitación (Solo ADMIN y CREADOR) -->
      @if (mostrarForm()) {
        <div class="card shadow-sm border-0 rounded-4 mb-4">
          <div class="card-header bg-primary text-white py-3 rounded-top-4 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold">
              <i class="bi bi-robot me-2"></i>{{ editandoId() ? 'Editar Capacitación #' + editandoId() : 'Registrar Nueva Capacitación con IA' }}
            </h6>
            <button class="btn btn-sm btn-light" (click)="mostrarForm.set(false)">Cerrar</button>
          </div>
          <div class="card-body p-4">
            <form (ngSubmit)="guardarCapacitacion()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Código Institucional</label>
                  <input type="text" class="form-control" name="codigo" [(ngModel)]="formCap.codigo" placeholder="Ej. CAP-005" required>
                </div>
                <div class="col-md-5">
                  <label class="form-label small fw-semibold">Título de la Capacitación</label>
                  <input type="text" class="form-control" name="titulo" [(ngModel)]="formCap.titulo" placeholder="Título del curso" required>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Nivel</label>
                  <select class="form-select" name="nivel" [(ngModel)]="formCap.nivel">
                    <option value="BASICO">BASICO</option>
                    <option value="INTERMEDIO">INTERMEDIO</option>
                    <option value="AVANZADO">AVANZADO</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Estado</label>
                  <select class="form-select" name="estado" [(ngModel)]="formCap.estado">
                    <option value="BORRADOR">BORRADOR</option>
                    <option value="PUBLICADO">PUBLICADO</option>
                  </select>
                </div>
                <div class="col-md-9">
                  <label class="form-label small fw-semibold">Prompt / Tema para Generación con IA</label>
                  <textarea class="form-control" rows="2" name="temaPrompt" [(ngModel)]="formCap.temaPrompt"
                            placeholder="Describe el tema y objetivos que debe cubrir la capacitación..." required></textarea>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Nota Mínima Aprobatoria</label>
                  <input type="number" class="form-control" name="notaMinima" [(ngModel)]="formCap.notaMinima" min="1" max="20" required>
                </div>
              </div>
              <div class="mt-3 text-end">
                <button type="button" class="btn btn-outline-secondary me-2" (click)="mostrarForm.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary fw-semibold">
                  <i class="bi bi-save me-1"></i>{{ editandoId() ? 'Actualizar Cambios' : 'Guardar Capacitación' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabla de Capacitaciones -->
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Código</th>
                  <th>Título y Tema Prompt</th>
                  <th>Nivel</th>
                  <th>Estado</th>
                  <th>Nota Mín.</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of capacitaciones(); track c.capacitacionId) {
                  <tr>
                    <td class="ps-4"><span class="badge bg-dark font-monospace">{{ c.codigo }}</span></td>
                    <td>
                      <div class="fw-bold">{{ c.titulo }}</div>
                      <div class="text-muted small text-truncate" style="max-width: 360px;">{{ c.temaPrompt }}</div>
                    </td>
                    <td>
                      <span class="badge bg-info text-dark">{{ c.nivel }}</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="c.estado === 'PUBLICADO' ? 'bg-success' : 'bg-warning text-dark'">
                        {{ c.estado }}
                      </span>
                    </td>
                    <td class="fw-semibold">{{ c.notaMinima }} / 20</td>
                    <td class="text-end pe-4">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" (click)="irAEvaluacion(c.capacitacionId!)" title="Rendir Examen">
                          <i class="bi bi-pencil-square me-1"></i>Examen
                        </button>
                        @if (authService.hasRole('ADMIN', 'CREADOR')) {
                          <button class="btn btn-outline-primary" (click)="abrirBancoPreguntas(c)" title="Banco de Preguntas">
                            <i class="bi bi-list-check me-1"></i>Preguntas
                          </button>
                          <button class="btn btn-outline-secondary" (click)="editarCapacitacion(c)" title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                        }
                        @if (authService.hasRole('ADMIN')) {
                          <button class="btn btn-outline-danger" (click)="eliminarCapacitacion(c.capacitacionId!)" title="Eliminar (Solo ADMIN)">
                            <i class="bi bi-trash"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">No hay capacitaciones activas registradas.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Panel de Banco de Preguntas de la Capacitación seleccionada -->
      @if (cursoSeleccionado()) {
        <div class="card shadow border-0 rounded-4 mt-4">
          <div class="card-header bg-dark text-white py-3 rounded-top-4 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold">
              <i class="bi bi-patch-question-fill me-2 text-warning"></i>
              Banco de Preguntas — {{ cursoSeleccionado()?.codigo }}: {{ cursoSeleccionado()?.titulo }}
            </h6>
            <button class="btn btn-sm btn-outline-light" (click)="cursoSeleccionado.set(null)">Cerrar Banco</button>
          </div>
          <div class="card-body p-4">

            <!-- Formulario para agregar pregunta -->
            <form (ngSubmit)="guardarPregunta()" class="bg-light p-3 rounded-3 mb-4 border">
              <h6 class="fw-bold small text-uppercase text-secondary mb-3">Agregar Nueva Pregunta de Opción Múltiple</h6>
              <div class="row g-2">
                <div class="col-md-12">
                  <input type="text" class="form-control form-control-sm" name="enunciado" [(ngModel)]="formPregunta.enunciado"
                         placeholder="Enunciado de la pregunta..." required>
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control form-control-sm" name="opcionA" [(ngModel)]="formPregunta.opcionA" placeholder="Opción A" required>
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control form-control-sm" name="opcionB" [(ngModel)]="formPregunta.opcionB" placeholder="Opción B" required>
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control form-control-sm" name="opcionC" [(ngModel)]="formPregunta.opcionC" placeholder="Opción C" required>
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control form-control-sm" name="opcionD" [(ngModel)]="formPregunta.opcionD" placeholder="Opción D" required>
                </div>
                <div class="col-md-3">
                  <select class="form-select form-select-sm" name="respuestaCorrecta" [(ngModel)]="formPregunta.respuestaCorrecta">
                    <option value="A">Respuesta Correcta: A</option>
                    <option value="B">Respuesta Correcta: B</option>
                    <option value="C">Respuesta Correcta: C</option>
                    <option value="D">Respuesta Correcta: D</option>
                  </select>
                </div>
                <div class="col-md-7">
                  <input type="text" class="form-control form-control-sm" name="justificacion" [(ngModel)]="formPregunta.justificacion"
                         placeholder="Justificación pedagógica (retroalimentación)...">
                </div>
                <div class="col-md-2">
                  <button type="submit" class="btn btn-sm btn-primary w-100 fw-semibold">
                    <i class="bi bi-plus-circle me-1"></i>Agregar
                  </button>
                </div>
              </div>
            </form>

            <!-- Lista de preguntas actuales -->
            <div class="list-group">
              @for (p of preguntasCurso(); track p.preguntaId; let idx = $index) {
                <div class="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <div class="fw-bold">{{ idx + 1 }}. {{ p.enunciado }}</div>
                    <div class="small text-muted mt-1">
                      <span class="me-3"><strong>A)</strong> {{ p.opcionA }}</span>
                      <span class="me-3"><strong>B)</strong> {{ p.opcionB }}</span>
                      <span class="me-3"><strong>C)</strong> {{ p.opcionC }}</span>
                      <span><strong>D)</strong> {{ p.opcionD }}</span>
                    </div>
                    @if (p.justificacion) {
                      <div class="small text-secondary fst-italic mt-1">
                        <i class="bi bi-info-circle me-1"></i>{{ p.justificacion }}
                      </div>
                    }
                  </div>
                  <button class="btn btn-sm btn-outline-danger" (click)="eliminarPregunta(p.preguntaId!)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              } @empty {
                <div class="text-center text-muted py-3 small">Esta capacitación aún no tiene preguntas registradas.</div>
              }
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CapacitacionesComponent implements OnInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);
  private router = inject(Router);

  capacitaciones = signal<Capacitacion[]>([]);
  mostrarForm = signal(false);
  editandoId = signal<number | null>(null);
  mensajeExito = signal('');
  mensajeError = signal('');

  cursoSeleccionado = signal<Capacitacion | null>(null);
  preguntasCurso = signal<Pregunta[]>([]);

  formCap: Capacitacion = this.nuevoFormCap();
  formPregunta: Pregunta = this.nuevoFormPregunta(0);

  ngOnInit(): void {
    this.cargarCapacitaciones();
  }

  nuevoFormCap(): Capacitacion {
    return {
      codigo: '',
      titulo: '',
      temaPrompt: '',
      nivel: 'BASICO',
      estado: 'BORRADOR',
      notaMinima: 14,
      activo: true
    };
  }

  nuevoFormPregunta(capacitacionId: number): Pregunta {
    return {
      capacitacionId,
      enunciado: '',
      opcionA: '',
      opcionB: '',
      opcionC: '',
      opcionD: '',
      respuestaCorrecta: 'A',
      justificacion: ''
    };
  }

  cargarCapacitaciones(): void {
    this.apiService.listarCapacitaciones().subscribe({
      next: (lista) => this.capacitaciones.set(lista),
      error: () => this.mensajeError.set('No se pudo cargar el listado de capacitaciones')
    });
  }

  abrirFormularioNuevo(): void {
    this.editandoId.set(null);
    this.formCap = this.nuevoFormCap();
    this.mostrarForm.set(true);
  }

  editarCapacitacion(c: Capacitacion): void {
    this.editandoId.set(c.capacitacionId!);
    this.formCap = { ...c };
    this.mostrarForm.set(true);
  }

  guardarCapacitacion(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
    const id = this.editandoId();

    const peticion = id
      ? this.apiService.actualizarCapacitacion(id, this.formCap)
      : this.apiService.crearCapacitacion(this.formCap);

    peticion.subscribe({
      next: () => {
        this.mensajeExito.set(id ? 'Capacitación actualizada correctamente' : 'Capacitación registrada correctamente');
        this.mostrarForm.set(false);
        this.cargarCapacitaciones();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al guardar la capacitación';
        this.mensajeError.set(msg);
      }
    });
  }

  eliminarCapacitacion(id: number): void {
    if (!confirm('¿Confirmas dar de baja lógica esta capacitación?')) return;
    this.apiService.eliminarCapacitacion(id).subscribe({
      next: () => {
        this.mensajeExito.set('Capacitación dada de baja lógica (activo = false)');
        this.cargarCapacitaciones();
      },
      error: (err) => this.mensajeError.set(err.error?.message || 'No tienes permisos para eliminar')
    });
  }

  abrirBancoPreguntas(c: Capacitacion): void {
    this.cursoSeleccionado.set(c);
    this.formPregunta = this.nuevoFormPregunta(c.capacitacionId!);
    this.cargarPreguntas(c.capacitacionId!);
  }

  cargarPreguntas(capacitacionId: number): void {
    this.apiService.listarPreguntasPorCapacitacion(capacitacionId).subscribe({
      next: (lista) => this.preguntasCurso.set(lista)
    });
  }

  guardarPregunta(): void {
    const curso = this.cursoSeleccionado();
    if (!curso?.capacitacionId) return;
    this.formPregunta.capacitacionId = curso.capacitacionId;

    this.apiService.crearPregunta(this.formPregunta).subscribe({
      next: () => {
        this.mensajeExito.set('Pregunta agregada al banco de la capacitación');
        this.formPregunta = this.nuevoFormPregunta(curso.capacitacionId!);
        this.cargarPreguntas(curso.capacitacionId!);
      },
      error: (err) => this.mensajeError.set(err.error?.message || 'Error al registrar la pregunta')
    });
  }

  eliminarPregunta(preguntaId: number): void {
    const curso = this.cursoSeleccionado();
    if (!curso?.capacitacionId) return;
    this.apiService.eliminarPregunta(preguntaId).subscribe({
      next: () => this.cargarPreguntas(curso.capacitacionId!)
    });
  }

  irAEvaluacion(capacitacionId: number): void {
    this.router.navigate(['/evaluaciones'], { queryParams: { capacitacionId } });
  }
}