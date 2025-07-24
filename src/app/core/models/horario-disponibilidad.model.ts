// models/horario-disponibilidad.model.ts
export interface HorarioDisponibilidad {
  id?: number;
  dia: number; // 0 - 6
  horaInicio: string; // formato HH:mm
  horaFin: string;
}
