import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'material-icons',
    '[attr.aria-hidden]': 'true',
    '[style.font-size]': 'size()',
  },
  template: '{{ name() }}',
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<string | undefined>(undefined);
}
