export interface ReportParams {
  cliente?: string;
  fechaInicio: string;
  fechaFin: string;
  page?: number;
  size?: number;
}

export interface ReportFilterForm {
  fechaInicio: string;
  fechaFin: string;
  cliente: string;
  todosClientes: boolean;
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
