import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  of,
  skip,
  Subject,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ClientService } from '@core/services/client/client.service';
import { ClientResponse, PagedResponse } from '@core/interface';
import {
  SelectFieldComponent,
  SelectOption,
} from '../select-field/select-field.component';

interface ClientState {
  options: SelectOption[];
  page: number;
  totalPages: number;
}

const INITIAL_STATE: ClientState = { options: [], page: 0, totalPages: 1 };

/**
 * A ControlValueAccessor that wraps `app-select-field` and owns the full
 * client-loading lifecycle: initial fetch, debounced API search, and
 * infinite-scroll pagination.
 *
 * Usage (same as any CVA):
 * ```html
 * <app-client-select formControlName="clienteId" />
 * <app-client-select formControlName="cliente" label="Filtrar cliente" placeholder="Todos" />
 * ```
 */
@Component({
  selector: 'app-client-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectFieldComponent, ReactiveFormsModule],
  template: `
    <app-select-field
      [formControl]="innerCtrl"
      [label]="label()"
      [placeholder]="placeholder()"
      [options]="clientOptions()"
      (searchChange)="onSearch($event)"
      (nearEnd)="onScrollEnd()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClientSelectFieldComponent),
      multi: true,
    },
  ],
})
export class ClientSelectFieldComponent implements ControlValueAccessor {
  private readonly clientService = inject(ClientService);

  readonly label = input('Cliente');
  readonly placeholder = input('Seleccione cliente');

  protected readonly innerCtrl = new FormControl<string>('', {
    nonNullable: true,
  });

  private readonly searchQuery = signal('');
  private readonly scrollEnd$ = new Subject<void>();

  private readonly clientState = signal<ClientState>(INITIAL_STATE);

  readonly clientOptions = computed(() => this.clientState().options);

  constructor() {
    // Initial load immediately on construction
    this.fetchClients(1, '')
      .pipe(takeUntilDestroyed())
      .subscribe((paged) => {
        if (paged) this.clientState.set(this.toState(paged));
      });

    // User search → skip initial value, debounce, reset list, fetch page 1
    toObservable(this.searchQuery)
      .pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) => this.fetchClients(1, search)),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (paged) this.clientState.set(this.toState(paged));
      });

    // Scroll end → append next page; exhaustMap prevents concurrent requests
    this.scrollEnd$
      .pipe(
        filter(() => this.clientState().page < this.clientState().totalPages),
        exhaustMap(() =>
          this.fetchClients(this.clientState().page + 1, this.searchQuery()),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (!paged) return;
        this.clientState.update((prev) => ({
          ...this.toState(paged),
          options: [...prev.options, ...paged.content.map(this.toOption)],
        }));
      });

    // Propagate inner value changes to the parent form control
    this.innerCtrl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.onChangeFn(v));
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onScrollEnd(): void {
    this.scrollEnd$.next();
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onChangeFn: (v: string) => void = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onTouchedFn: () => void = () => {};

  writeValue(value: string): void {
    this.innerCtrl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
    this.innerCtrl.registerOnChange(() => this.onTouchedFn());
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.innerCtrl.disable() : this.innerCtrl.enable();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private fetchClients(page: number, search: string) {
    return this.clientService
      .getAll({ page, size: 20, ...(search ? { search } : {}) })
      .pipe(catchError(() => of(null)));
  }

  private readonly toOption = (c: ClientResponse): SelectOption => ({
    value: c.clienteId,
    label: c.nombre,
  });

  private toState(paged: PagedResponse<ClientResponse>): ClientState {
    return {
      options: paged.content.map(this.toOption),
      page: paged.page,
      totalPages: paged.totalPages,
    };
  }
}
