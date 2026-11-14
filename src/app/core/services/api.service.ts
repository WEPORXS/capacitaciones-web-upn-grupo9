import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Capacitacion,
  Pregunta,
  EvaluacionRequest,
  EvaluacionResponse,
  PerfilUsuario
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8088/api/v1';

  // ==========================================
  // 1. MÓDULO CAPACITACIONES (/api/v1/capacitaciones)
  // ==========================================
  listarCapacitaciones(): Observable<Capacitacion[]> {
    return this.http.get<Capacitacion[]>(`${this.baseUrl}/capacitaciones`);
  }

  obtenerCapacitacion(id: number): Observable<Capacitacion> {
    return this.http.get<Capacitacion>(`${this.baseUrl}/capacitaciones/${id}`);
  }

  crearCapacitacion(data: Capacitacion): Observable<Capacitacion> {
    return this.http.post<Capacitacion>(`${this.baseUrl}/capacitaciones`, data);
  }

  actualizarCapacitacion(id: number, data: Capacitacion): Observable<Capacitacion> {
    return this.http.put<Capacitacion>(`${this.baseUrl}/capacitaciones/${id}`, data);
  }

  eliminarCapacitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/capacitaciones/${id}`);
  }

  // ==========================================
  // 2. MÓDULO PREGUNTAS (/api/v1/preguntas)
  // ==========================================
  listarPreguntasPorCapacitacion(capacitacionId: number): Observable<Pregunta[]> {
    return this.http.get<Pregunta[]>(`${this.baseUrl}/preguntas?capacitacionId=${capacitacionId}`);
  }

  crearPregunta(data: Pregunta): Observable<Pregunta> {
    return this.http.post<Pregunta>(`${this.baseUrl}/preguntas`, data);
  }

  eliminarPregunta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/preguntas/${id}`);
  }

  // ==========================================
  // 3. MÓDULO EVALUACIONES (/api/v1/evaluaciones)
  // ==========================================
  rendirEvaluacion(data: EvaluacionRequest): Observable<EvaluacionResponse> {
    return this.http.post<EvaluacionResponse>(`${this.baseUrl}/evaluaciones`, data);
  }

  listarEvaluaciones(): Observable<EvaluacionResponse[]> {
    return this.http.get<EvaluacionResponse[]>(`${this.baseUrl}/evaluaciones`);
  }

  // ==========================================
  // 4. MÓDULO PERFILES - ADMIN (/api/v1/perfiles)
  // ==========================================
  listarPerfiles(): Observable<PerfilUsuario[]> {
    return this.http.get<PerfilUsuario[]>(`${this.baseUrl}/perfiles`);
  }

  crearPerfil(data: PerfilUsuario): Observable<PerfilUsuario> {
    return this.http.post<PerfilUsuario>(`${this.baseUrl}/perfiles`, data);
  }

  eliminarPerfil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/perfiles/${id}`);
  }
}