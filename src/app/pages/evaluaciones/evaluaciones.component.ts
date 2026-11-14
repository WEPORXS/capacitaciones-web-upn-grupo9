import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Capacitacion, Pregunta, EvaluacionResponse } from '../../core/models/api.models';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0"><i class="bi bi-award-fill text-success me-2"></i>Aula de Evaluación y Calificaciones</h3>
          <p class="text-muted small mb-0">Rendición de exámenes automatizados y registro de notas</p>
        </div>
      </div>

      @if (mensajeError()) {
        <div class="alert alert-warning py-2">{{ mensajeError() }}</div>
      }

      <!-- Tarjeta de Resultado Inmediato luego de enviar el examen (RF-09) -->
      @if (ultimoResultado()) {
        <div class="card shadow border-0 rounded-4 mb-4"
             [ngClass]="ultimoResultado()!.aprobado ? 'border-start border-success border-5' : 'border-start border-danger border-5'">
          <div class="card-body p-4 d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <span class="badge mb-2" [ngClass]="ultimoResultado()!.aprobado ? 'bg-success' : 'bg-danger'">
                {{ ultimoResultado()!.aprobado ? '¡EXAMEN APROBADO!' : 'EXAMEN NO APROBADO' }}
              </span>
              <h5 class="fw-bold mb-1">{{ ultimoResultado()!.tituloCapacitacion }}</h5>
              <p class="text-muted small mb-0">
                Alumno: <strong>{{ ultimoResultado()!.nombreAlumno }}</strong> ·
                Aciertos: <strong>{{ ultimoResultado()!.aciertos }} de {{ ultimoResultado()!.totalPreguntas }}</strong> ·
                Nota mínima requerida: <strong>{{ ultimoResultado()!.notaMinimaRequerida }}</strong>
              </p>
            </div>
            <div class="text-center mt-3 mt-md-0">
              <div class="display-5 fw-bold" [ngClass]="ultimoResultado()!.aprobado ? 'text-success' : 'text-danger'">
                {{ ultimoResultado()!.puntaje }} <span class="fs-5 text-muted">/ 20</span>
              </div>
              <div class="small text-muted">Puntaje Final</div>
            </div>
          </div>
        </div>
      }

      <!-- Examen Activo si vino con ?capacitacionId=... -->
      @if (cursoActivo() && preguntas().length > 0) {
        <div class="card shadow-sm border-0 rounded-4 mb-4">
          <div class="card-header bg-success text-white py-3 rounded-top-4">
            <h6 class="mb-0 fw-bold">
              <i class="bi bi-journal-check me-2"></i>
              Rindiendo Evaluación: {{ cursoActivo()?.codigo }} — {{ cursoActivo()?.titulo }}
            </h6>
          </div>
          <div class="card-body p-4">
            <form (ngSubmit)="enviarExamen()">
              @for (p of preguntas(); track p.preguntaId; let i = $index) {
                <div class="mb-4 pb-3 border-bottom">
                  <p class="fw-bold mb-2">{{ i + 1 }}. {{ p.enunciado }}</p>
                  <div class="row g-2">
                    @for (letra of ['A', 'B', 'C', 'D']; track letra) {
                      <div class="col-md-6">
                        <label class="d-flex align-items-center p-2 border rounded-3 cursor-pointer"
                               [class.bg-light]="respuestasMarcadas[p.preguntaId!] === letra"
                               [class.border-success]="respuestasMarcadas[p.preguntaId!] === letra">
                          <input type="radio"
                                 class="form-check-input me-2"
                                 [name]="'preg_' + p.preguntaId"
                                 [value]="letra"
                                 [(ngModel)]="respuestasMarcadas[p.preguntaId!]"
                                 required>
                          <span><strong>{{ letra }})</strong> {{ obtenerTextoOpcion(p, letra) }}</span>
                        </label>
                      </div>
                    }
                  </div>
                </div>
              }
              <div class="text-end">
                <button type="submit" class="btn btn-success px-4 fw-semibold">
                  <i class="bi bi-send-check me-2"></i>Enviar Respuestas y Calificar
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabla de Historial de Evaluaciones -->
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-header bg-white py-3 border-bottom">
          <h6 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i>Historial de Evaluaciones Registradas</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4"># ID</th>
                  <th>Capacitación</th>
                  <th>Alumno Evaluado</th>
                  <th>Puntaje Obtenido</th>
                  <th>Estado</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                @for (ev of historial(); track ev.evaluacionId) {
                  <tr>
                    <td class="ps-4 text-muted">#{{ ev.evaluacionId }}</td>
                    <td class="fw-semibold">{{ ev.tituloCapacitacion }}</td>
                    <td>{{ ev.nombreAlumno }}</td>
                    <td class="fw-bold">{{ ev.puntaje }} / 20</td>
                    <td>
                      <span class="badge" [ngClass]="ev.aprobado ? 'bg-success' : 'bg-danger'">
                        {{ ev.aprobado ? 'APROBADO' : 'DESAPROBADO' }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ ev.fechaEvaluacion | date:'dd/MM/yyyy HH:mm' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">Aún no se han registrado evaluaciones.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `
})
export class EvaluacionesComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  cursoActivo = signal<Capacitacion | null>(null);
  preguntas = signal<Pregunta[]>([]);
  historial = signal<EvaluacionResponse[]>([]);
  ultimoResultado = signal<EvaluacionResponse | null>(null);
  mensajeError = signal('');

  respuestasMarcadas: { [preguntaId: number]: string } = {};

  ngOnInit(): void {
    this.cargarHistorial();

    this.route.queryParams.subscribe(params => {
      const capId = Number(params['capacitacionId']);
      if (capId) {
        this.prepararExamen(capId);
      }
    });
  }

  prepararExamen(capacitacionId: number): void {
    this.mensajeError.set('');
    this.apiService.obtenerCapacitacion(capacitacionId).subscribe({
      next: (cap) => this.cursoActivo.set(cap)
    });

    this.apiService.listarPreguntasPorCapacitacion(capacitacionId).subscribe({
      next: (lista) => {
        this.preguntas.set(lista);
        this.respuestasMarcadas = {};
        if (lista.length === 0) {
          this.mensajeError.set('Esta capacitación todavía no tiene preguntas activas en el banco.');
        }
      }
    });
  }

  obtenerTextoOpcion(p: Pregunta, letra: string): string {
    switch (letra) {
      case 'A': return p.opcionA;
      case 'B': return p.opcionB;
      case 'C': return p.opcionC;
      case 'D': return p.opcionD;
      default: return '';
    }
  }

  enviarExamen(): void {
    const curso = this.cursoActivo();
    if (!curso?.capacitacionId) return;

    this.apiService.rendirEvaluacion({
      capacitacionId: curso.capacitacionId,
      respuestas: this.respuestasMarcadas
    }).subscribe({
      next: (res) => {
        this.ultimoResultado.set(res);
        this.cursoActivo.set(null);
        this.cargarHistorial();
      },
      error: (err) => this.mensajeError.set(err.error?.message || 'Error al calificar la evaluación')
    });
  }

  cargarHistorial(): void {
    this.apiService.listarEvaluaciones().subscribe({
      next: (lista) => this.historial.set(lista)
    });
  }
}