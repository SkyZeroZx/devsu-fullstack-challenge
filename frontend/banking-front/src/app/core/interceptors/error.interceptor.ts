import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';

interface ErrorHandler {
  type: 'error' | 'warn';
  message: string;
}

const HTTP_ERROR_MESSAGES = new Map<number, ErrorHandler>([
  [400, { type: 'error', message: 'Solicitud inválida. Verifique los datos.' }],
  [404, { type: 'warn', message: 'Recurso no encontrado.' }],
  [409, { type: 'error', message: 'Conflicto al procesar la solicitud.' }],
  [
    0,
    {
      type: 'error',
      message: 'Sin conexión. Verifique su red e intente nuevamente.',
    },
  ],
]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.includes('/api/auth/login')) {
        return throwError(() => error);
      }

      const serverMessage: string | undefined = error.error?.message;

      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login']);
        toast.warn({
          message: 'No autorizado',
        });
      } else if (error.status >= 500) {
        toast.error({ message: 'Error del servidor. Intente más tarde.' });
      } else {
        const handler = HTTP_ERROR_MESSAGES.get(error.status);
        if (handler) {
          toast[handler.type]({ message: serverMessage ?? handler.message });
        }
      }

      return throwError(() => error);
    }),
  );
};
