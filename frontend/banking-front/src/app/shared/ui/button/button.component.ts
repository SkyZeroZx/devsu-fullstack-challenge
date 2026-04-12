import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[btn], a[btn], div[btn]',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (loading()) {
      <svg
        class="btn__spinner"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="btn__spinner-track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="btn__spinner-head"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    }
    <ng-content />
  `,
  host: {
    '[attr.aria-busy]': 'loading() || null',
    '[attr.disabled]': 'loading() || null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly classes = computed(() => {
    return `btn btn--${this.variant()} btn--${this.size()}`;
  });

  readonly size = input<'sm' | 'lg' | 'xl' | '2xl'>('lg');
  readonly variant = input<
    'primary' | 'secondary' | 'warn' | 'danger' | 'success'
  >('primary');
  readonly loading = input(false, { transform: booleanAttribute });
}
