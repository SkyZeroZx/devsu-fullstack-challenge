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
import { AccountService } from '@core/services/account/account.service';
import { AccountResponse, PagedResponse } from '@core/interface';
import {
  SelectFieldComponent,
  SelectOption,
} from '../select-field/select-field.component';

interface AccountState {
  options: SelectOption[];
  page: number;
  totalPages: number;
}

const INITIAL_STATE: AccountState = { options: [], page: 0, totalPages: 1 };

@Component({
  selector: 'app-account-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectFieldComponent, ReactiveFormsModule],
  template: `
    <app-select-field
      [formControl]="innerCtrl"
      [label]="label()"
      [placeholder]="placeholder()"
      [options]="accountOptions()"
      (searchChange)="onSearch($event)"
      (nearEnd)="onScrollEnd()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountSelectFieldComponent),
      multi: true,
    },
  ],
})
export class AccountSelectFieldComponent implements ControlValueAccessor {
  private readonly accountService = inject(AccountService);

  readonly label = input('Cuenta');
  readonly placeholder = input('Seleccione cuenta');

  protected readonly innerCtrl = new FormControl<string>('', {
    nonNullable: true,
  });

  private readonly searchQuery = signal('');
  private readonly scrollEnd$ = new Subject<void>();

  private readonly accountState = signal<AccountState>(INITIAL_STATE);

  readonly accountOptions = computed(() => this.accountState().options);

  constructor() {
    this.fetchAccounts(1, '')
      .pipe(takeUntilDestroyed())
      .subscribe((paged) => {
        if (paged) this.accountState.set(this.toState(paged));
      });

    toObservable(this.searchQuery)
      .pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) => this.fetchAccounts(1, search)),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (paged) this.accountState.set(this.toState(paged));
      });

    this.scrollEnd$
      .pipe(
        filter(() => this.accountState().page < this.accountState().totalPages),
        exhaustMap(() =>
          this.fetchAccounts(this.accountState().page + 1, this.searchQuery()),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((paged) => {
        if (!paged) return;
        this.accountState.update((prev) => ({
          ...this.toState(paged),
          options: [...prev.options, ...paged.content.map(this.toOption)],
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

  private fetchAccounts(page: number, search: string) {
    return this.accountService
      .getAll({ page, size: 20, ...(search ? { search } : {}) })
      .pipe(catchError(() => of(null)));
  }

  private readonly toOption = (a: AccountResponse): SelectOption => ({
    value: a.numeroCuenta,
    label: `${a.numeroCuenta} — ${a.cliente}`,
  });

  private toState(paged: PagedResponse<AccountResponse>): AccountState {
    return {
      options: paged.content.map(this.toOption),
      page: paged.page,
      totalPages: paged.totalPages,
    };
  }
}
