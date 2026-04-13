import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': 'borderRadius()',
  },
  template: '',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly borderRadius = input('4px');
}
