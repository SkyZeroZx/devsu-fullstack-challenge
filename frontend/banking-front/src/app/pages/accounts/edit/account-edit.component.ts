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
import { AccountRequest, AccountResponse } from '@core/interface';
import { AccountService } from '@core/services/account/account.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { AccountFormComponent } from '../components/account-form.component';

@Component({
  selector: 'app-account-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AccountFormComponent,
    SkeletonComponent,
    RouterLink,
    ButtonComponent,
    ClickTrackingDirective,
  ],
  templateUrl: './account-edit.component.html',
  styleUrl: './account-edit.component.scss',
})
export class AccountEditComponent {
  private readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Bound from the route param :id via withComponentInputBinding() */
  readonly id = input.required<string>();

  readonly saving = signal(false);
  readonly formCtrl = new FormControl<AccountResponse | null>(null);

  private readonly accountForm = viewChild(AccountFormComponent);

  readonly account = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.accountService.getById(id).pipe(
          catchError(() => {
            this.router.navigate(['/cuentas']);
            return of(null);
          }),
        ),
      ),
    ),
  );

  private readonly _initForm = effect(() => {
    const data = this.account();
    if (data) untracked(() => this.formCtrl.setValue(data));
  });

  onSubmit(): void {
     if (!this.formCtrl.valid) {
      this.accountForm()?.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.accountService
      .update(this.id(), this.formCtrl.value as unknown as AccountRequest)
      .subscribe({
        next: () => {
          this.toast.success({ message: 'Cuenta actualizada exitosamente' });
          this.router.navigate(['/cuentas']);
        },
        error: () => this.saving.set(false),
      });
  }
}
