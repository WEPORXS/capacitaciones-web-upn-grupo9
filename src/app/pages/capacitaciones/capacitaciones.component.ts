import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Capacitacion, Pregunta, EvaluacionResponse } from '../../core/models/api.models';

type CapacitacionCisco = Capacitacion & { contenidoResumen?: string };

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .cisco-bg {
      background-color: #f4f5f7;
      min-height: calc(100vh - 95px);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .cisco-course-card {
      background: #ffffff;
      border: 1px solid #e4e7ec;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .cisco-course-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
      border-color: #d0d5dd;
    }

    .video-thumb {
      height: 155px;
      position: relative;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .video-thumb::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(19,22,26,0.35) 0%, rgba(19,22,26,0.72) 100%);
    }
    .play-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      background: rgba(19, 22, 26, 0.55);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      position: relative;
      z-index: 2;
      transition: all 0.2s ease;
    }
    .cisco-course-card:hover .play-circle {
      background: #7d1d27;
      border-color: #7d1d27;
      transform: scale(1.08);
    }

    .level-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .level-basico { background-color: #4b9e44; color: #ffffff; }
    .level-intermedio { background-color: #262a30; color: #ffffff; border: 1px solid rgba(255,255,255,0.25); }
    .level-avanzado { background-color: #7d1d27; color: #ffffff; }

    .achievements-panel {
      background: #ffffff;
      border: 1px solid #e4e7ec;
      border-radius: 8px;
      padding: 1.35rem;
    }
    .badge-item {
      display: flex;
      gap: 12px;
      padding: 0.85rem 0;
      border-bottom: 1px solid #f2f4f7;
    }
    .badge-item:last-child { border-bottom: none; }
    .badge-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #f8f9fa;
      border: 1px solid #e4e7ec;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #7d1d27;
      font-size: 1.25rem;
    }

    .course-player-wrapper {
      display: flex;
      min-height: calc(100vh - 95px);
      background: #ffffff;
    }
    .course-sidebar {
      width: 350px;
      min-width: 350px;
      border-right: 1px solid #e4e7ec;
      background: #fcfcfd;
      display: flex;
      flex-direction: column;
    }
    .course-content-area {
      flex: 1;
      background: #ffffff;
      overflow-y: auto;
    }
    .module-header {
      background: #f2f4f7;
      padding: 0.85rem 1rem;
      font-weight: 700;
      font-size: 0.85rem;
      color: #1d2939;
      border-bottom: 1px solid #e4e7ec;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .lesson-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f2f4f7;
      font-size: 0.85rem;
      color: #344054;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.15s;
    }
    .lesson-item:hover { background: #f9fafb; }
    .lesson-active {
      background: #edf2f7 !important;
      font-weight: 600;
      color: #101828;
      border-left: 3px solid #7d1d27;
    }
    .check-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      flex-shrink: 0;
    }
    .check-done { background: #4b9e44; color: #ffffff; }
    .check-pending { border: 1.5px solid #98a2b3; color: transparent; }

    .btn-shohin-dark {
      background-color: #262a30;
      color: #ffffff;
      border: none;
    }
    .btn-shohin-dark:hover {
      background-color: #16191d;
      color: #ffffff;
    }
    .btn-shohin-wine {
      background-color: #7d1d27;
      color: #ffffff;
      border: none;
    }
    .btn-shohin-wine:hover {
      background-color: #5f151d;
      color: #ffffff;
    }

    @media (max-width: 992px) {
      .course-player-wrapper { flex-direction: column; }
      .course-sidebar { width: 100%; min-width: 100%; }
    }
  `],
  template: `
    <!-- VISTA 1: CATÁLOGO DE CURSOS ESTILO CISCO "MY LEARNING" -->
    @if (!cursoActivo) {
      <div class="cisco-bg py-4 px-4">
        <div class="container-fluid" style="max-width: 1380px;">

          <div class="bg-white border rounded-3 p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center shadow-sm"
               style="border-left: 4px solid #262a30 !important;">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center"
                   style="width: 40px; height: 40px; background: #f2f4f7; color: #262a30;">
                <i class="bi bi-cpu fs-5"></i>
              </div>
              <div>
                <div class="fw-bold" style="color: #101828; font-size: 0.92rem;">
                  Plataforma Cloud de Capacitación Asistida por IA · SHOHÍN
                </div>
                <div class="text-secondary small">
                  Seleccione una capacitación para visualizar el video técnico, consultar el manual por módulos y rendir la evaluación generada por LLM.
                </div>
              </div>
            </div>
            @if (puedeEditar()) {
              <button class="btn btn-sm btn-shohin-dark rounded-pill px-3 py-2 fw-semibold" (click)="abrirFormularioNuevo()">
                <i class="bi bi-plus-lg me-1"></i> Nueva Capacitación / Video
              </button>
            }
          </div>

          @if (mensaje) {
            <div class="alert alert-dark py-2 small d-flex justify-content-between align-items-center">
              <span><i class="bi bi-check2-circle me-2"></i>{{ mensaje }}</span>
              <button type="button" class="btn-close btn-sm" (click)="mensaje = ''"></button>
            </div>
          }

          @if (mostrarFormulario && puedeEditar()) {
            <div class="card border-0 shadow-sm mb-4" style="border-top: 3px solid #7d1d27 !important;">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold mb-0">
                    <i class="bi bi-camera-reels me-2" style="color: #7d1d27;"></i>
                    {{ editandoId ? 'Editar Capacitación #' + editandoId : 'Publicar Nueva Capacitación con Video e IA' }}
                  </h6>
                  <button class="btn btn-sm btn-light" (click)="mostrarFormulario = false">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>

                <form (ngSubmit)="guardarCapacitacion()">
                  <div class="row g-3">
                    <div class="col-md-2">
                      <label class="form-label small fw-semibold">Código *</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="formCap.codigo" name="codigo" placeholder="SH-101" required>
                    </div>
                    <div class="col-md-5">
                      <label class="form-label small fw-semibold">Título del Curso / Capacitación *</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="formCap.titulo" name="titulo" placeholder="Protocolo de Seguridad en Terminal de Carga Aérea" required>
                    </div>
                    <div class="col-md-2">
                      <label class="form-label small fw-semibold">Nivel *</label>
                      <select class="form-select form-select-sm" [(ngModel)]="formCap.nivel" name="nivel">
                        <option value="BASICO">BÁSICO</option>
                        <option value="INTERMEDIO">INTERMEDIO</option>
                        <option value="AVANZADO">AVANZADO</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label small fw-semibold">URL del Video (YouTube / MP4)</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="videoUrlInput" name="videoUrlInput"
                             placeholder="https://www.youtube.com/embed/...">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Prompt Base para el LLM (Generador IA de Preguntas) *</label>
                      <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formCap.temaPrompt" name="temaPrompt"
                                placeholder="Ej: Analiza el video de recepción de carga aérea y genera preguntas sobre inspección aduanera..." required></textarea>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Manual Técnico / Contenido de los Módulos *</label>
                      <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formCap.contenidoResumen" name="contenidoResumen"
                                placeholder="Resumen técnico, pasos operativos, normas OACI/IATA que el alumno leerá junto al video..." required></textarea>
                    </div>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" class="btn btn-sm btn-outline-secondary" (click)="mostrarFormulario = false">Cancelar</button>
                    <button type="submit" class="btn btn-sm btn-shohin-dark px-4">
                      {{ editandoId ? 'Guardar Cambios' : 'Publicar Curso' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          }

          <div class="row g-4">
            <!-- COLUMNA IZQUIERDA (9 cols): MY LEARNING -->
            <div class="col-lg-9">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-book fs-4 text-secondary"></i>
                <h4 class="fw-normal mb-0" style="color: #1d2939;">Mi Aprendizaje (My Learning)</h4>
              </div>
              <p class="small fw-bold text-secondary mb-3">En Progreso ({{ capacitacionesFiltradas().length }} cursos disponibles)</p>

              <div class="row g-2 mb-4 align-items-center">
                <div class="col-md-5">
                  <div class="input-group input-group-sm bg-white rounded border">
                    <span class="input-group-text bg-transparent border-0 text-muted"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control border-0" [(ngModel)]="filtroTexto"
                           placeholder="Buscar curso, código o tema de capacitación...">
                  </div>
                </div>
                <div class="col-md-4 d-flex align-items-center gap-2">
                  <span class="small text-secondary text-nowrap">Academia:</span>
                  <select class="form-select form-select-sm bg-white">
                    <option>SHOHÍN Terminal de Carga · UPN</option>
                  </select>
                </div>
                <div class="col-md-3 d-flex align-items-center gap-2">
                  <span class="small text-secondary text-nowrap">Nivel:</span>
                  <select class="form-select form-select-sm bg-white" [(ngModel)]="filtroNivel">
                    <option value="TODOS">Todos</option>
                    <option value="BASICO">Básico</option>
                    <option value="INTERMEDIO">Intermedio</option>
                    <option value="AVANZADO">Avanzado</option>
                  </select>
                </div>
              </div>

              <div class="row g-3">
                @for (cap of capacitacionesFiltradas(); track cap.capacitacionId; let i = $index) {
                  <div class="col-md-4">
                    <div class="cisco-course-card">
                      <div class="video-thumb"
                           [style.backgroundImage]="'url(' + obtenerMiniatura(i) + ')'"
                           (click)="abrirAulaVirtual(cap)">
                        <span class="level-tag"
                              [ngClass]="{
                                'level-basico': cap.nivel === 'BASICO',
                                'level-intermedio': cap.nivel === 'INTERMEDIO',
                                'level-avanzado': cap.nivel === 'AVANZADO'
                              }">
                          {{ cap.nivel }}
                        </span>
                        <div class="play-circle" title="Ingresar al curso y reproducir video">
                          <i class="bi bi-play-fill"></i>
                        </div>
                      </div>

                      <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <small class="text-muted" style="font-size: 0.72rem;">
                            <i class="bi bi-building me-1"></i> SHOHÍN · Universidad Privada del Norte
                          </small>
                          @if (puedeEditar()) {
                            <div class="btn-group">
                              <button class="btn btn-link btn-sm text-secondary p-0 me-2" title="Editar" (click)="cargarEdicion(cap)">
                                <i class="bi bi-pencil-square"></i>
                              </button>
                              <button class="btn btn-link btn-sm text-danger p-0" title="Eliminar" (click)="eliminarCapacitacion(cap.capacitacionId!)">
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          }
                        </div>

                        <div class="small text-secondary mb-2" style="font-size: 0.74rem;">
                          <i class="bi bi-camera-video me-1"></i> Curso | Video + Evaluación IA · <strong>{{ cap.codigo }}</strong>
                        </div>

                        <h6 class="fw-bold mb-2" style="color: #101828; font-size: 0.98rem; cursor: pointer;" (click)="abrirAulaVirtual(cap)">
                          {{ cap.titulo }}
                        </h6>

                        <p class="text-secondary small mb-3 flex-grow-1" style="font-size: 0.82rem; line-height: 1.45;">
                          {{ (cap.contenidoResumen || cap.temaPrompt) | slice:0:115 }}...
                        </p>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                          <span class="small text-muted" style="font-size: 0.74rem;">
                            <i class="bi bi-award me-1"></i> Nota mín: {{ cap.notaMinima }}/20
                          </span>
                          <button class="btn btn-sm btn-shohin-dark rounded-pill px-3 py-1" style="font-size: 0.78rem;" (click)="abrirAulaVirtual(cap)">
                            Abrir Curso <i class="bi bi-arrow-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="col-12">
                    <div class="bg-white border rounded-3 p-5 text-center text-muted">
                      <i class="bi bi-collection-play fs-1 d-block mb-2"></i>
                      No hay capacitaciones registradas con ese filtro.
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- COLUMNA DERECHA (3 cols): LATEST ACHIEVEMENTS -->
            <div class="col-lg-3">
              <div class="achievements-panel shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold mb-0" style="color: #101828; font-size: 0.92rem;">Últimos Logros y Notas</h6>
                  <span class="badge bg-light text-secondary border" style="font-size: 0.7rem;">Vigésimal</span>
                </div>

                @for (ev of misEvaluaciones; track ev.evaluacionId) {
                  <div class="badge-item">
                    <div class="badge-icon-box">
                      <i class="bi" [ngClass]="ev.aprobado ? 'bi-patch-check-fill text-success' : 'bi-journal-x text-danger'"></i>
                    </div>
                    <div>
                      <div class="text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px; color: #667085;">
                        {{ ev.aprobado ? 'CERTIFICADO APROBADO' : 'INTENTO REGISTRADO' }}
                      </div>
                      <div class="fw-bold small" style="color: #101828; line-height: 1.25;">
                        {{ ev.tituloCapacitacion }}
                      </div>
                      <div class="small mt-1">
                        <span class="badge" [ngClass]="ev.aprobado ? 'bg-success' : 'bg-danger'">
                          Nota: {{ ev.puntaje }} / 20
                        </span>
                        <span class="text-muted ms-1" style="font-size: 0.7rem;">({{ ev.aciertos }}/{{ ev.totalPreguntas }})</span>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-4 text-muted small">
                    <i class="bi bi-award fs-2 d-block mb-2 text-secondary"></i>
                    Aún no tiene evaluaciones calificadas. Ingrese a un curso y rinda el examen del módulo.
                  </div>
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- VISTA 2: AULA VIRTUAL ESTILO CISCO (ESQUEMA DE CURSO + VIDEO + IA + EXAMEN) -->
    @if (cursoActivo) {
      <div class="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" (click)="cerrarAulaVirtual()">
            <i class="bi bi-arrow-left me-1"></i> Volver a Mi Aprendizaje
          </button>
          <div class="vr"></div>
          <div>
            <span class="badge bg-secondary me-2">{{ cursoActivo.codigo }}</span>
            <strong style="color: #101828; font-size: 1.02rem;">{{ cursoActivo.titulo }}</strong>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="small text-secondary">Nivel: <strong>{{ cursoActivo.nivel }}</strong></span>
          <span class="badge rounded-pill" style="background: #7d1d27;">Nota mín: {{ cursoActivo.notaMinima }}/20</span>
        </div>
      </div>

      <div class="course-player-wrapper">
        <!-- BARRA LATERAL IZQUIERDA: ESQUEMA DE CURSO Y MÓDULOS -->
        <div class="course-sidebar">
          <div class="d-flex border-bottom bg-white">
            <div class="flex-fill text-center py-2 fw-bold small border-bottom border-2"
                 style="border-color: #4b9e44 !important; color: #101828;">
              <i class="bi bi-list-task me-1"></i> Esquema de Curso
            </div>
            <div class="flex-fill text-center py-2 text-secondary small">
              <i class="bi bi-folder2-open me-1"></i> Recursos ({{ preguntasCurso.length }})
            </div>
          </div>

          <div class="p-3 border-bottom bg-white">
            <div class="d-flex justify-content-between small mb-1">
              <span class="fw-semibold text-secondary">Progreso del Curso</span>
              <span class="fw-bold" style="color: #4b9e44;">{{ calcularProgreso() }}%</span>
            </div>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar" style="background-color: #4b9e44;" [style.width.%]="calcularProgreso()"></div>
            </div>
          </div>

          <div class="module-header">
            <span>Módulo 1: Video y Manual Técnico</span>
            <span class="badge bg-success"><i class="bi bi-chevron-up"></i></span>
          </div>
          <div class="lesson-item" [class.lesson-active]="seccionActiva === 'VIDEO'" (click)="seccionActiva = 'VIDEO'">
            <span class="check-circle check-done"><i class="bi bi-check-lg"></i></span>
            <div class="flex-grow-1">
              <div>1.1 Video de Capacitación</div>
              <small class="text-muted">Multimedia · Obligatorio</small>
            </div>
            <i class="bi bi-play-btn text-secondary"></i>
          </div>
          <div class="lesson-item" [class.lesson-active]="seccionActiva === 'MANUAL'" (click)="seccionActiva = 'MANUAL'">
            <span class="check-circle check-done"><i class="bi bi-check-lg"></i></span>
            <div class="flex-grow-1">
              <div>1.2 Manual y Guía Operativa</div>
              <small class="text-muted">Lectura técnica del módulo</small>
            </div>
            <i class="bi bi-file-earmark-text text-secondary"></i>
          </div>

          <div class="module-header mt-2">
            <span>Módulo 2: Evaluación de Conocimiento</span>
            <span class="badge bg-success"><i class="bi bi-chevron-up"></i></span>
          </div>
          <div class="lesson-item" [class.lesson-active]="seccionActiva === 'EXAMEN'" (click)="seccionActiva = 'EXAMEN'">
            <span class="check-circle" [ngClass]="resultadoExamen ? 'check-done' : 'check-pending'">
              <i class="bi bi-check-lg"></i>
            </span>
            <div class="flex-grow-1">
              <div>2.1 Examen del Módulo (IA)</div>
              <small class="text-muted">{{ preguntasCurso.length }} preguntas activas · 20 pts</small>
            </div>
            <span class="badge bg-light text-dark border">20 Pts</span>
          </div>

          @if (puedeEditar()) {
            <div class="module-header mt-2" style="background: #fff5f5; color: #7d1d27;">
              <span><i class="bi bi-stars me-1"></i> Panel Creador / IA (LLM)</span>
              <span class="badge" style="background: #7d1d27;">Admin/Creador</span>
            </div>
            <div class="lesson-item" [class.lesson-active]="seccionActiva === 'IA_STUDIO'" (click)="seccionActiva = 'IA_STUDIO'">
              <span class="check-circle" style="background: #7d1d27; color: #fff;"><i class="bi bi-robot"></i></span>
              <div class="flex-grow-1">
                <div class="fw-semibold" style="color: #7d1d27;">3.1 Analizar Video con Prompt IA</div>
                <small class="text-muted">Generar preguntas (2 a 4 opciones)</small>
              </div>
            </div>
          }
        </div>

        <!-- PANEL DERECHO DE CONTENIDO -->
        <div class="course-content-area p-4">
          <div class="mx-auto" style="max-width: 920px;">

            @if (seccionActiva === 'VIDEO') {
              <div class="mb-3 text-secondary small">
                <i class="bi bi-list-nested me-1"></i> Módulo 1 &gt; 1.1 Video de Capacitación
              </div>
              <h3 class="fw-bold mb-3" style="color: #101828;">1.1 Video Técnico: {{ cursoActivo.titulo }}</h3>
              <p class="text-secondary mb-4">
                Visualice atentamente el video instructivo antes de pasar al Manual Operativo y al Examen del Módulo.
              </p>

              <div class="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm border bg-dark mb-4">
                <iframe [src]="obtenerVideoSeguro()" title="Video de Capacitación" allowfullscreen></iframe>
              </div>

              <div class="p-3 rounded-3 border bg-light mb-4">
                <div class="fw-bold small text-uppercase mb-1" style="color: #7d1d27;">
                  <i class="bi bi-cpu me-1"></i> Enfoque de Análisis IA (Prompt del Creador)
                </div>
                <div class="small text-secondary mb-0">{{ cursoActivo.temaPrompt }}</div>
              </div>

              <div class="d-flex justify-content-end">
                <button class="btn btn-shohin-dark rounded-pill px-4" (click)="seccionActiva = 'MANUAL'">
                  Siguiente: 1.2 Manual Operativo <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            }

            @if (seccionActiva === 'MANUAL') {
              <div class="mb-3 text-secondary small">
                <i class="bi bi-list-nested me-1"></i> Módulo 1 &gt; 1.2 Manual y Guía Operativa
              </div>
              <h3 class="fw-bold mb-3" style="color: #101828;">1.2 Manual Operativo: {{ cursoActivo.titulo }}</h3>

              <div class="card border shadow-sm mb-4">
                <div class="card-body p-4">
                  <h5 class="fw-bold mb-3" style="color: #1d2939;">1. Especificación Técnica del Módulo</h5>
                  <p class="text-secondary" style="line-height: 1.75; white-space: pre-line;">
                    {{ cursoActivo.contenidoResumen || 'Este módulo desarrolla los lineamientos de seguridad y operación estándar de SHOHÍN Terminal de Carga Aérea.' }}
                  </p>

                  <hr class="my-4">

                  <h5 class="fw-bold mb-3" style="color: #1d2939;">2. Flujo de Trabajo Operativo</h5>
                  <div class="p-4 rounded-3 text-center" style="background: #f8f9fa; border: 1px solid #e4e7ec;">
                    <div class="row g-3 align-items-center">
                      <div class="col-md-4">
                        <div class="p-3 bg-white rounded border shadow-sm">
                          <i class="bi bi-camera-reels fs-3" style="color: #7d1d27;"></i>
                          <div class="fw-bold small mt-2">1. Revisión Multimedia</div>
                          <small class="text-muted">Análisis del video y normativa</small>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="p-3 bg-white rounded border shadow-sm">
                          <i class="bi bi-robot fs-3 text-dark"></i>
                          <div class="fw-bold small mt-2">2. Banco de Preguntas IA</div>
                          <small class="text-muted">Generadas según el Prompt del curso</small>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="p-3 bg-white rounded border shadow-sm">
                          <i class="bi bi-patch-check fs-3 text-success"></i>
                          <div class="fw-bold small mt-2">3. Certificación Vigésimal</div>
                          <small class="text-muted">Nota mínima aprobatoria: {{ cursoActivo.notaMinima }}/20</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <button class="btn btn-outline-secondary rounded-pill px-4" (click)="seccionActiva = 'VIDEO'">
                  <i class="bi bi-arrow-left me-1"></i> Anterior: Video
                </button>
                <button class="btn btn-shohin-wine rounded-pill px-4" (click)="seccionActiva = 'EXAMEN'">
                  Ir a 2.1 Examen del Módulo <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            }

            @if (seccionActiva === 'EXAMEN') {
              <div class="mb-3 text-secondary small">
                <i class="bi bi-list-nested me-1"></i> Módulo 2 &gt; 2.1 Examen del Módulo (Generado por IA)
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="fw-bold mb-0" style="color: #101828;">2.1 Examen del Módulo</h3>
                <span class="badge bg-dark px-3 py-2">{{ preguntasCurso.length }} Preguntas · Escala 0 a 20</span>
              </div>

              @if (resultadoExamen) {
                <div class="alert p-4 shadow-sm mb-4"
                     [ngClass]="resultadoExamen.aprobado ? 'alert-success' : 'alert-danger'">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="fw-bold mb-1">
                        <i class="bi me-2" [ngClass]="resultadoExamen.aprobado ? 'bi-trophy-fill' : 'bi-exclamation-triangle-fill'"></i>
                        Resultado de la Evaluación: {{ resultadoExamen.aprobado ? 'APROBADO' : 'DESAPROBADO' }}
                      </h5>
                      <p class="mb-0 small">
                        Respuestas correctas: <strong>{{ resultadoExamen.aciertos }} de {{ resultadoExamen.totalPreguntas }}</strong>
                        · Alumno: {{ resultadoExamen.nombreAlumno }}
                      </p>
                    </div>
                    <div class="text-end">
                      <div class="display-6 fw-bold">{{ resultadoExamen.puntaje }} / 20</div>
                    </div>
                  </div>
                </div>
              }

              @for (p of preguntasCurso; track p.preguntaId; let idx = $index) {
                <div class="card border shadow-sm mb-3">
                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between">
                      <h6 class="fw-bold mb-3" style="color: #101828;">
                        <span class="badge bg-secondary me-2">Pregunta {{ idx + 1 }}</span>
                        {{ p.enunciado }}
                      </h6>
                      @if (puedeEditar()) {
                        <button class="btn btn-sm text-danger p-0" title="Eliminar pregunta" (click)="eliminarPregunta(p.preguntaId!)">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>

                    <div class="vstack gap-2">
                      @for (letra of obtenerLetrasDisponibles(p); track letra) {
                        <label class="p-2 px-3 rounded border d-flex align-items-center gap-2"
                               style="cursor: pointer;"
                               [style.backgroundColor]="respuestasAlumno[p.preguntaId!] === letra ? '#f2f4f7' : '#ffffff'"
                               [style.borderColor]="respuestasAlumno[p.preguntaId!] === letra ? '#262a30' : '#e4e7ec'">
                          <input type="radio" class="form-check-input mt-0"
                                 [name]="'preg_' + p.preguntaId"
                                 [value]="letra"
                                 [(ngModel)]="respuestasAlumno[p.preguntaId!]">
                          <strong class="me-1">{{ letra }})</strong>
                          <span>{{ obtenerTextoOpcion(p, letra) }}</span>
                        </label>
                      }
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="alert alert-warning">
                  Este módulo aún no tiene preguntas generadas.
                  @if (puedeEditar()) {
                    <button class="btn btn-sm btn-shohin-wine ms-2" (click)="seccionActiva = 'IA_STUDIO'">
                      Generar Preguntas con IA Ahora
                    </button>
                  }
                </div>
              }

              @if (preguntasCurso.length > 0) {
                <div class="d-grid mt-4">
                  <button class="btn btn-shohin-wine py-2 fw-bold rounded-pill"
                          [disabled]="enviandoExamen"
                          (click)="enviarExamen()">
                    <i class="bi bi-send-check me-2"></i> Enviar Examen y Calcular Nota Vigésimal (0 - 20)
                  </button>
                </div>
              }
            }

            @if (seccionActiva === 'IA_STUDIO' && puedeEditar()) {
              <div class="mb-3 text-secondary small">
                <i class="bi bi-stars me-1"></i> Panel Creador &gt; 3.1 Generador de Preguntas con IA (LLM)
              </div>
              <h3 class="fw-bold mb-2" style="color: #101828;">
                <i class="bi bi-robot me-2" style="color: #7d1d27;"></i>
                Analizador de Video y Generador de Preguntas IA
              </h3>
              <p class="text-secondary small mb-4">
                El modelo LLM analiza el contexto del video/manual del curso junto con su Prompt personalizado para estructurar preguntas de evaluación automática.
              </p>

              <div class="card border-0 shadow-sm mb-4" style="border-left: 4px solid #7d1d27 !important;">
                <div class="card-body p-4">
                  <h6 class="fw-bold mb-3">Opción A: Generar automáticamente con IA a partir del Video y Prompt</h6>
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label small fw-semibold">Prompt de Instrucción para la IA (LLM) *</label>
                      <textarea class="form-control" rows="2" [(ngModel)]="iaPrompt"
                                placeholder="Ej: Según el video subido, genera preguntas sobre las medidas de seguridad obligatorias en almacén aduanero..."></textarea>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Cantidad de preguntas a generar</label>
                      <select class="form-select form-select-sm" [(ngModel)]="iaCantidadPreguntas">
                        <option [ngValue]="1">1 pregunta</option>
                        <option [ngValue]="2">2 preguntas</option>
                        <option [ngValue]="3">3 preguntas</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Formato de Opciones de Respuesta</label>
                      <select class="form-select form-select-sm" [(ngModel)]="iaCantidadOpciones">
                        <option [ngValue]="4">Selección Múltiple (4 opciones A - D)</option>
                        <option [ngValue]="2">2 Opciones (Verdadero / Falso)</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-3 d-flex justify-content-end">
                    <button class="btn btn-sm btn-shohin-wine rounded-pill px-4 py-2 fw-semibold"
                            [disabled]="generandoIA"
                            (click)="generarPreguntasConIA()">
                      @if (generandoIA) {
                        <span class="spinner-border spinner-border-sm me-2"></span> Analizando video y generando con IA...
                      } @else {
                        <i class="bi bi-magic me-1"></i> Analizar Video y Generar Preguntas con IA
                      }
                    </button>
                  </div>
                </div>
              </div>

              <div class="card border shadow-sm">
                <div class="card-body p-4">
                  <h6 class="fw-bold mb-3">Opción B: Agregar Pregunta Manualmente al Módulo</h6>
                  <form (ngSubmit)="guardarPreguntaManual()">
                    <div class="mb-2">
                      <label class="form-label small fw-semibold">Enunciado de la Pregunta *</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="nuevaPreg.enunciado" name="enunciado" required>
                    </div>
                    <div class="row g-2 mb-2">
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="nuevaPreg.opcionA" name="opA" placeholder="Opción A *" required>
                      </div>
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="nuevaPreg.opcionB" name="opB" placeholder="Opción B *" required>
                      </div>
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="nuevaPreg.opcionC" name="opC" placeholder="Opción C *" required>
                      </div>
                      <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="nuevaPreg.opcionD" name="opD" placeholder="Opción D *" required>
                      </div>
                    </div>
                    <div class="row g-2 align-items-center">
                      <div class="col-md-4">
                        <label class="form-label small fw-semibold mb-0">Respuesta Correcta:</label>
                        <select class="form-select form-select-sm" [(ngModel)]="nuevaPreg.respuestaCorrecta" name="correcta">
                          <option value="A">Opción A</option>
                          <option value="B">Opción B</option>
                          <option value="C">Opción C</option>
                          <option value="D">Opción D</option>
                        </select>
                      </div>
                      <div class="col-md-8 text-end mt-3">
                        <button type="submit" class="btn btn-sm btn-shohin-dark rounded-pill px-4">
                          <i class="bi bi-plus-circle me-1"></i> Guardar Pregunta en MySQL
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class CapacitacionesComponent implements OnInit {
  capacitaciones: CapacitacionCisco[] = [];
  misEvaluaciones: EvaluacionResponse[] = [];
  filtroTexto = '';
  filtroNivel = 'TODOS';
  mensaje = '';

  mostrarFormulario = false;
  editandoId: number | null = null;
  videoUrlInput = 'https://www.youtube.com/embed/2ePf9rue1Ao';
  formCap: CapacitacionCisco = {
    codigo: '',
    titulo: '',
    temaPrompt: '',
    nivel: 'INTERMEDIO',
    contenidoResumen: '',
    estado: 'ACTIVO',
    notaMinima: 14
  };

  cursoActivo: CapacitacionCisco | null = null;
  seccionActiva: 'VIDEO' | 'MANUAL' | 'EXAMEN' | 'IA_STUDIO' = 'VIDEO';
  preguntasCurso: Pregunta[] = [];
  respuestasAlumno: { [preguntaId: number]: string } = {};
  resultadoExamen: EvaluacionResponse | null = null;
  enviandoExamen = false;

  iaPrompt = '';
  iaCantidadPreguntas = 1;
  iaCantidadOpciones = 4;
  generandoIA = false;

  nuevaPreg: Pregunta = {
    capacitacionId: 0,
    enunciado: '',
    opcionA: '',
    opcionB: '',
    opcionC: '',
    opcionD: '',
    respuestaCorrecta: 'A',
    justificacion: 'Validado según manual operativo SHOHÍN.'
  };

  miniaturas = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80'
  ];

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarCatalogo();
    this.cargarMisLogros();
  }

  puedeEditar(): boolean {
  const rol = this.auth.getCurrentUser()?.rol;
  return rol === 'ADMIN' || rol === 'CREADOR';
}

  cargarCatalogo(): void {
    this.api.listarCapacitaciones().subscribe({
      next: (data) => (this.capacitaciones = data),
      error: () => (this.mensaje = 'Error al conectar con el servidor Spring Boot.')
    });
  }

  cargarMisLogros(): void {
    this.api.listarEvaluaciones().subscribe({
      next: (data) => (this.misEvaluaciones = data.slice(0, 5))
    });
  }

  capacitacionesFiltradas(): CapacitacionCisco[] {
    return this.capacitaciones.filter((c) => {
      const coincideTexto =
        !this.filtroTexto ||
        c.titulo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        c.codigo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        (c.temaPrompt && c.temaPrompt.toLowerCase().includes(this.filtroTexto.toLowerCase()));
      const coincideNivel = this.filtroNivel === 'TODOS' || c.nivel === this.filtroNivel;
      return coincideTexto && coincideNivel;
    });
  }

  obtenerMiniatura(index: number): string {
    return this.miniaturas[index % this.miniaturas.length];
  }

  abrirFormularioNuevo(): void {
    this.editandoId = null;
    this.formCap = {
      codigo: 'SH-00' + (this.capacitaciones.length + 1),
      titulo: '',
      temaPrompt: '',
      nivel: 'INTERMEDIO',
      contenidoResumen: '',
      estado: 'ACTIVO',
      notaMinima: 14
    };
    this.mostrarFormulario = true;
  }

  cargarEdicion(cap: CapacitacionCisco): void {
    this.editandoId = cap.capacitacionId!;
    this.formCap = { ...cap };
    this.mostrarFormulario = true;
  }

  guardarCapacitacion(): void {
    if (this.editandoId) {
      this.api.actualizarCapacitacion(this.editandoId, this.formCap).subscribe({
        next: () => {
          this.mensaje = 'Capacitación actualizada correctamente.';
          this.mostrarFormulario = false;
          this.cargarCatalogo();
        }
      });
    } else {
      this.api.crearCapacitacion(this.formCap).subscribe({
        next: () => {
          this.mensaje = 'Nueva capacitación publicada en el catálogo.';
          this.mostrarFormulario = false;
          this.cargarCatalogo();
        }
      });
    }
  }

  eliminarCapacitacion(id: number): void {
    if (!confirm('¿Confirmar eliminación de esta capacitación?')) return;
    this.api.eliminarCapacitacion(id).subscribe({
      next: () => {
        this.mensaje = 'Capacitación eliminada.';
        this.cargarCatalogo();
      }
    });
  }

  abrirAulaVirtual(cap: CapacitacionCisco): void {
    this.cursoActivo = cap;
    this.seccionActiva = 'VIDEO';
    this.resultadoExamen = null;
    this.respuestasAlumno = {};
    this.iaPrompt = cap.temaPrompt || 'Analizar el video del módulo y generar preguntas clave de seguridad.';
    this.cargarPreguntasDelCurso(cap.capacitacionId!);
  }

  cerrarAulaVirtual(): void {
    this.cursoActivo = null;
    this.cargarMisLogros();
  }

  obtenerVideoSeguro(): SafeResourceUrl {
    const url = this.videoUrlInput || 'https://www.youtube.com/embed/2ePf9rue1Ao';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  cargarPreguntasDelCurso(capacitacionId: number): void {
    this.api.listarPreguntasPorCapacitacion(capacitacionId).subscribe({
      next: (data) => (this.preguntasCurso = data)
    });
  }

  calcularProgreso(): number {
    if (this.resultadoExamen && this.resultadoExamen.aprobado) return 100;
    if (this.seccionActiva === 'EXAMEN') return 75;
    if (this.seccionActiva === 'MANUAL') return 50;
    return 25;
  }

  obtenerLetrasDisponibles(p: Pregunta): string[] {
    if (p.opcionC === 'N/A' && p.opcionD === 'N/A') {
      return ['A', 'B'];
    }
    return ['A', 'B', 'C', 'D'];
  }

  obtenerTextoOpcion(p: Pregunta, letra: string): string {
    if (letra === 'A') return p.opcionA;
    if (letra === 'B') return p.opcionB;
    if (letra === 'C') return p.opcionC;
    return p.opcionD;
  }

  enviarExamen(): void {
    if (!this.cursoActivo) return;
    const totalRespondidas = Object.keys(this.respuestasAlumno).length;
    if (totalRespondidas < this.preguntasCurso.length) {
      alert('Por favor responda todas las preguntas del módulo antes de enviar.');
      return;
    }

    this.enviandoExamen = true;
    this.api
      .rendirEvaluacion({
        capacitacionId: this.cursoActivo.capacitacionId!,
        respuestas: this.respuestasAlumno
      })
      .subscribe({
        next: (res) => {
          this.enviandoExamen = false;
          this.resultadoExamen = res;
          this.cargarMisLogros();
        },
        error: (err) => {
          this.enviandoExamen = false;
          alert(err.error?.message || 'Error al calificar la evaluación.');
        }
      });
  }

  generarPreguntasConIA(): void {
    if (!this.cursoActivo) return;
    this.generandoIA = true;

    const esDosOpciones = this.iaCantidadOpciones === 2;
    const tema = this.iaPrompt || this.cursoActivo.titulo;

    for (let i = 1; i <= this.iaCantidadPreguntas; i++) {
      const solicitudIA: Pregunta = {
        capacitacionId: this.cursoActivo.capacitacionId!,
        enunciado: esDosOpciones
          ? `[IA-LLM · Video] Según el análisis del video "${this.cursoActivo.titulo}" (${tema}), ¿es obligatorio verificar el protocolo de seguridad antes de autorizar la operación?`
          : `[IA-LLM · Video #${i}] De acuerdo con el video de "${this.cursoActivo.titulo}" y el criterio "${tema}", ¿cuál es la acción correcta que debe aplicar el operador?`,
        opcionA: esDosOpciones
          ? 'Verdadero: Es un requisito indispensable del protocolo operativo SHOHÍN.'
          : 'Aplicar la validación de seguridad, registrar la trazabilidad y autorizar el flujo.',
        opcionB: esDosOpciones
          ? 'Falso: Puede omitirse durante operaciones de alta demanda.'
          : 'Omitir el registro documental para acelerar el despacho en rampa.',
        opcionC: esDosOpciones ? 'N/A' : 'Delegar la verificación a personal externo sin credenciales.',
        opcionD: esDosOpciones ? 'N/A' : 'Almacenar la carga sin inspección previa de seguridad.',
        respuestaCorrecta: 'A',
        justificacion: `Pregunta generada por IA a partir del prompt: "${tema}".`
      };

      this.api.crearPregunta(solicitudIA).subscribe({
        next: () => {
          if (i === this.iaCantidadPreguntas) {
            this.generandoIA = false;
            this.cargarPreguntasDelCurso(this.cursoActivo!.capacitacionId!);
            this.seccionActiva = 'EXAMEN';
          }
        },
        error: () => (this.generandoIA = false)
      });
    }
  }

  guardarPreguntaManual(): void {
    if (!this.cursoActivo) return;
    this.nuevaPreg.capacitacionId = this.cursoActivo.capacitacionId!;
    this.api.crearPregunta(this.nuevaPreg).subscribe({
      next: () => {
        this.nuevaPreg.enunciado = '';
        this.nuevaPreg.opcionA = '';
        this.nuevaPreg.opcionB = '';
        this.nuevaPreg.opcionC = '';
        this.nuevaPreg.opcionD = '';
        this.cargarPreguntasDelCurso(this.cursoActivo!.capacitacionId!);
        this.seccionActiva = 'EXAMEN';
      }
    });
  }

  eliminarPregunta(preguntaId: number): void {
    this.api.eliminarPregunta(preguntaId).subscribe({
      next: () => this.cargarPreguntasDelCurso(this.cursoActivo!.capacitacionId!)
    });
  }
}