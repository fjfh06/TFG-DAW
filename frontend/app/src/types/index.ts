// ============================================================
// TIPOS DEL DOMINIO — Club Shaolin Las Gabias
// ============================================================

export type Role = 'admin' | 'ayudante' | 'user';

// === AUTH ===
export interface User {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  rol: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// === RESPUESTAS GENÉRICAS ===
export interface MessageResponse {
  message: string;
}

// === ENTIDADES BÁSICAS (Completaremos más adelante) ===
export interface Temporada {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
}

export interface Cinturon {
  id: number;
  nombre: string;
  orden_jerarquia: number;
}

export interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  foto?: string | null;
  activo: boolean;
  grado_actual_id?: number | null;
  user_id?: number | null;
}

export interface TarifaMensual {
  id: number;
  nombre: string;
  precio_base: string | number;
  temporada_id: number;
}

export interface InscripcionMensual {
  id: number;
  alumno_id: number;
  tarifa_mensual_id: number;
  temporada_id: number;
}

export type EstadoPago = 'pagado' | 'pendiente' | 'parcial';
export type EstadoPagoParticipacion = 'pagado' | 'pendiente' | 'no_aplica';

export interface PagoMensualidad {
  id: number;
  alumno_id: number;
  mes: number;
  anio: number;
  tarifa_aplicada_id?: number | null;
  cantidad: string | number;
  estado: EstadoPago;
  fecha_pago?: string | null;
  observaciones?: string | null;
}

export interface TipoLicencia {
  id: number;
  nombre: string;
  precio: string | number;
  temporada_id: number;
}

export interface LicenciaAlumno {
  id: number;
  alumno_id: number;
  tipo_licencia_id: number;
  estado_pago: EstadoPago;
  fecha_pago?: string | null;
  fecha_inicio_validez?: string | null;
  fecha_fin_validez?: string | null;
}

export interface Asistencia {
  id: number;
  fecha: string;
  alumno_id: number;
}

export type TipoEvento = 'campeonato' | 'exhibicion' | 'curso' | 'concentracion' | 'examen';
export type EstadoEvento = 'programado' | 'realizado' | 'cancelado';
export type EstadoInscripcion = 'inscrito' | 'baja';

export interface Evento {
  id: number;
  nombre: string;
  tipo: TipoEvento;
  fecha_inicio: string;
  fecha_fin: string;
  lugar?: string | null;
  precio_inscripcion: string | number;
  estado: EstadoEvento;
  temporada_id: number;
}

export interface ResultadoCompeticion {
  id: number;
  puesto?: string | null;
  categoria_final?: string | null;
  observaciones?: string | null;
}

export interface Participacion {
  id: number;
  evento_id: number;
  alumno_id: number;
  categoria?: string | null;
  estado_inscripcion: EstadoInscripcion;
  estado_pago: EstadoPagoParticipacion;
  resultado?: ResultadoCompeticion | null;
}
