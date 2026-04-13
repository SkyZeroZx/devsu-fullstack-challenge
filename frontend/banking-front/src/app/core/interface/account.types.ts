export type AccountType = 'AHORRO' | 'CORRIENTE';

export interface AccountRequest {
  numeroCuenta: string;
  tipoCuenta: AccountType;
  saldoInicial: number;
  estado: boolean;
  clienteId: string;
}

export interface AccountResponse {
  numeroCuenta: string;
  tipoCuenta: AccountType;
  saldoInicial: number;
  estado: boolean;
  clienteId: string;
  cliente: string;
}
