export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  perfilId: number;
  nombreCompleto: string;
  email: string;
  rol: 'ADMIN' | 'CREADOR' | 'ALUMNO';
}

export interface Capacitacion {
  capacitacionId?: number;
  codigo: string;
  titulo: string;
  temaPrompt: string;
  nivel: string;
  estado?: string;
  notaMinima: number;
  activo?: boolean;
}

export interface Pregunta {
  preguntaId?: number;
  capacitacionId: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  respuestaCorrecta?: string;
  justificacion?: string;
  activo?: boolean;
}

export interface EvaluacionRequest {
  capacitacionId: number;
  respuestas: { [preguntaId: number]: string };
}

export interface EvaluacionResponse {
  evaluacionId: number;
  capacitacionId: number;
  tituloCapacitacion: string;
  alumnoId: number;
  nombreAlumno: string;
  totalPreguntas?: number;
  aciertos?: number;
  puntaje: number;
  notaMinimaRequerida: number;
  aprobado: boolean;
  fechaEvaluacion: string;
}

export interface PerfilUsuario {
  perfilId?: number;
  nombreCompleto: string;
  email: string;
  password?: string;
  rol: string;
  activo?: boolean;
}