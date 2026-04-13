import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { ScrollEndDirective } from '@shared/directives/scroll-end/scroll-end.directive';

export interface SelectOption {
  value: string;
  label: string;
}

let nextSelectId = 0;

@Component({
  selector: 'app-select-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollEndDirective],
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
  host: {
    class: 'field',
    '[class.field--disabled]': 'disabled()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SelectFieldComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);
  private readonly elRef = inject(ElementRef);
  private readonly injector = inject(Injector);

  readonly label = input('');
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('Seleccione');

  /** Emits when the user scrolls near the bottom of the options list. */
  readonly nearEnd = output<void>();

  /** Emits the current search query whenever the user types in the search box. */
  readonly searchChange = output<string>();

  readonly fieldId = `select-field-${++nextSelectId}`;

  protected readonly value = signal<string>('');
  protected readonly disabled = signal(false);
  protected readonly invalid = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onChangeFn: (v: unknown) => void = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onTouchedFn: () => void = () => {};

  protected readonly filteredOptions = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  protected readonly selectedLabel = computed(
    () =>
      this.options().find((o) => o.value === this.value())?.label ??
      this.placeholder(),
  );

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    const ctrl = this.ngControl?.control;
    if (!ctrl) return;
    ctrl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.invalid.set(!!(ctrl.invalid && ctrl.touched)));
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  protected toggle(): void {
    if (this.disabled()) return;

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.activeIndex.set(-1);
    afterNextRender(
      () => {
        // @ts-expect-error Accessing directly the DOM to focus the input, since using ViewChild causes timing issues
        // Also this is woraround valid previous used in angular.dev before to migrate to signal forms
        // Migrate to signal forms we signal form pass to stable instead of experimental
        const input = this.elRef.nativeElement.querySelector<HTMLInputElement>(
          '[data-testid="search"]',
        );

        input?.focus();
        this.searchChange.emit('');
      },
      { injector: this.injector },
    );
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.onTouchedFn();
  }

  protected selectOption(opt: SelectOption): void {
    this.value.set(opt.value);
    this.onChangeFn(opt.value);
    this.close();
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.activeIndex.set(0);
    this.searchChange.emit(value);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, opts.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
    } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
      event.preventDefault();
      const opt = opts[this.activeIndex()];
      if (opt) this.selectOption(opt);
    }
  }

  writeValue(val: unknown): void {
    this.value.set(String(val ?? ''));
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
