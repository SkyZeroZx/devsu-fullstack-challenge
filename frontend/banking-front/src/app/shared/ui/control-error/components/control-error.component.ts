import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';

@Component({
  templateUrl: './control-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./control-error.component.scss'],
})
export class ControlErrorComponent {
  readonly text = input<string | null>(null);

  readonly _text = computed(() => this.text());
  readonly _hide = computed(() => !this.text());
}
