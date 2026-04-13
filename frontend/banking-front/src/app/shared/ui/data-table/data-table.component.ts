import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableColumnDirective } from './table-column.directive';
import { PaginatorComponent } from '@shared/ui/paginator/paginator.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, PaginatorComponent, SkeletonComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T = unknown> {
  readonly rows = input<T[]>([]);
  readonly totalElements = input(0);
  readonly page = model(0);
  readonly size = input(10);
  readonly loading = input(false);
  readonly ariaLabel = input('');
  readonly emptyMessage = input('No hay datos disponibles');

  protected readonly columns =
    contentChildren<TableColumnDirective<T>>(TableColumnDirective);

  protected readonly skeletonRows = Array.from({ length: 5 });
}
