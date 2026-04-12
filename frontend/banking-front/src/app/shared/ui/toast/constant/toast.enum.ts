export const ToastTypes = {
  success: 'success',
  warn: 'warn',
  error: 'error',
  info: 'info',
} as const;

export type ToastTypes = (typeof ToastTypes)[keyof typeof ToastTypes];
