export interface ReportParams {
  cliente?: string;
  fechaInicio: string;
  fechaFin: string;
}

/** Shape used for the report filter form (cliente is always present as a string). */
export interface ReportFilterForm {
  fechaInicio: string;
  fechaFin: string;
  cliente: string;
}

export interface ReportRow {
  fecha: string;
  cliente: string;
  numeroCuenta: string;
  tipo: string;
  saldoInicial: number;
  estado: boolean;
  movimiento: number;
  saldoDisponible: number;
}

export interface ReportPdfResponse {
  reporte: string;
}
