import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientRequest, ClientResponse } from '@core/interface';
import { ClientService } from '@core/services/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ClientFormComponent } from '../components/client-form.component';
import { ControlErrorModule } from '@shared/ui/control-error/control-error.module';

@Component({
  selector: 'app-client-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ClientFormComponent,
    SkeletonComponent,
    RouterLink,
    ButtonComponent,
    ClickTrackingDirective,
    ControlErrorModule,
  ],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.scss',
})
export class ClientEditComponent {
  private readonly clientService = inject(ClientService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Bound from the route param :id via withComponentInputBinding() */
  readonly id = input.required<string>();

  readonly saving = signal(false);
  readonly formCtrl = new FormControl<ClientResponse | null>(null);

  /**
   * viewChild is used to call markAllAsTouched() on the nested CVA form.
   * Injecting NgControl (self) inside the CVA alongside NG_VALIDATORS creates
   * a circular dependency, so we trigger touched propagation from the host instead.
   */
  private readonly clientForm = viewChild(ClientFormComponent);

  readonly client = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.clientService.getById(id).pipe(
          catchError(() => {
            this.router.navigate(['/clientes']);
            return of(null);
          }),
        ),
      ),
    ),
  );

  constructor() {
    effect(() => {
      const data = this.client();
      if (data) untracked(() => this.formCtrl.setValue(data));
    });
  }

  onSubmit(): void {
    if (this.formCtrl.invalid) {
      this.clientForm()?.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.clientService
      .update(this.id(), this.formCtrl.value as unknown as ClientRequest)
      .subscribe({
        next: () => {
          this.toast.success({ message: 'Cliente actualizado exitosamente' });
          this.router.navigate(['/clientes']);
        },
        error: () => this.saving.set(false),
      });
  }
}
