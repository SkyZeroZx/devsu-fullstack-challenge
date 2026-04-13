import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-demo-modal-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo-modal-content.component.html',
  styleUrl: './demo-modal-content.component.scss',
})
export class DemoModalContentComponent {}
