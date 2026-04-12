import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appControlErrorContainer]',
})
export class ControlErrorContainerDirective {
  readonly vcr = inject(ViewContainerRef);
}
