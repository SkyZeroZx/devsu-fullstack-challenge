export type MovementType = 'CREDITO' | 'DEBITO';

export interface MovementRequest {
  numeroCuenta: string;
  tipoMovimiento: MovementType;
  valor: number;
}

export interface MovementResponse {
  id: number;
  fecha: string;
  tipoMovimiento: MovementType;
  valor: number;
  saldo: number;
  numeroCuenta: string;
}
