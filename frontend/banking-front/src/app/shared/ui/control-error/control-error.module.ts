import { NgModule } from '@angular/core';

import { ControlErrorComponent } from './components/control-error.component';
import { ControlErrorContainerDirective } from './directives/control-error-container.directive';
import { ControlErrorsDirective } from './directives/control-error.directive';

export { FORM_ERRORS, defaultErrors } from './form-error';
export type { ControlErrors } from './interface/control-error.interface';

@NgModule({
  imports: [
    ControlErrorComponent,
    ControlErrorContainerDirective,
    ControlErrorsDirective,
  ],
  exports: [ControlErrorContainerDirective, ControlErrorsDirective],
})
export class ControlErrorModule {}
