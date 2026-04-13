import { Directive, inject, input, TemplateRef } from '@angular/core';

export interface TableColumnContext<T> {
  $implicit: T;
}

@Directive({ selector: 'ng-template[appTableColumn]' })
export class TableColumnDirective<T = unknown> {
  readonly appTableColumn = input.required<string>();
  readonly header = input.required<string>();
  readonly templateRef = inject<TemplateRef<TableColumnContext<T>>>(
    TemplateRef<TableColumnContext<T>>,
  );

  /**
   * Phantom input — pass the rows array to enable TypeScript type inference for
   * the `let-row` template variable. The value is never used at runtime.
   * Follows the same convention as Angular's `ngForOf`.
   *
   * @example
   * `<ng-template appTableColumn="id" [appTableColumnOf]="rows" let-row>`
   */
  readonly appTableColumnOf = input<readonly T[] | undefined>(undefined);

  static ngTemplateContextGuard<T>(
    _dir: TableColumnDirective<T>,
    ctx: unknown,
  ): ctx is TableColumnContext<T> {
    return true;
  }
}
