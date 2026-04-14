import { computed, signal } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  Observable,
  skip,
  Subject,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PagedResponse } from '@core/interface';
import { SelectOption } from '@shared/ui/form-field/select-field/select-field.component';

interface PagedSelectState {
  options: SelectOption[];
  page: number;
  totalPages: number;
}

const INITIAL_STATE: PagedSelectState = { options: [], page: 0, totalPages: 1 };

export abstract class BasePagedSelectComponent<
  T,
> implements ControlValueAccessor {
  protected readonly innerCtrl = new FormControl<string>('', {
    nonNullable: true,
  });

  private readonly searchQuery = signal('');
  private readonly scrollEnd$ = new Subject<void>();
  private readonly state = signal<PagedSelectState>(INITIAL_STATE);

  readonly options = computed(() => this.state().options);

  constructor(
    private readonly fetchPageFn: (
      page: number,
      search: string,
    ) => Observable<PagedResponse<T> | null>,
    private readonly toOptionFn: (item: T) => SelectOption,
  ) {
    this.fetchPageFn(1, '')
      .pipe(takeUntilDestroyed())
      .subscribe((paged) => {
        if (paged) this.state.set(this.toState(paged));
      });

    toObservable(this.searchQuery)
      .pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) => this.fetchPageFn(1, search)),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (paged) this.state.set(this.toState(paged));
      });

    this.scrollEnd$
      .pipe(
        filter(() => this.state().page < this.state().totalPages),
        exhaustMap(() =>
          this.fetchPageFn(this.state().page + 1, this.searchQuery()),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (!paged) return;
        this.state.update((prev) => ({
          ...this.toState(paged),
          options: [
            ...prev.options,
            ...paged.content.map((item) => this.toOptionFn(item)),
          ],
        }));
      });

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
    if (isDisabled) {
      return this.innerCtrl.disable();
    }
    this.innerCtrl.enable();
  }

  private toState(paged: PagedResponse<T>): PagedSelectState {
    return {
      options: paged.content.map((item) => this.toOptionFn(item)),
      page: paged.page,
      totalPages: paged.totalPages,
    };
  }
}
