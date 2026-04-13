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
  templateUrl: './button.component.html',
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
