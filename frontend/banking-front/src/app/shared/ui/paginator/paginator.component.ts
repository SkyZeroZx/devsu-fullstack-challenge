import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  host: { role: 'navigation', '[attr.aria-label]': '"Paginación"' },
})
export class PaginatorComponent {
  readonly page = model.required<number>();
  readonly size = input.required<number>();
  readonly totalElements = input.required<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalElements() / this.size())),
  );

  protected readonly from = computed(() =>
    this.totalElements() === 0 ? 0 : (this.page() - 1) * this.size() + 1,
  );

  protected readonly to = computed(() =>
    Math.min(this.page() * this.size(), this.totalElements()),
  );

  protected goTo(page: number): void {
    this.page.set(page);
  }
}
