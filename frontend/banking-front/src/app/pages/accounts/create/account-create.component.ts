import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountRequest } from '@core/interface';
import { AccountService } from '@core/services/account/account.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { AccountFormComponent } from '../components/account-form.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-account-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AccountFormComponent,
    RouterLink,
    ButtonComponent,
    ClickTrackingDirective,
    IconComponent,
  ],
  templateUrl: './account-create.component.html',
  styleUrl: './account-create.component.scss',
})
export class AccountCreateComponent {
  private readonly accountForm = viewChild(AccountFormComponent);

  private readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly createAccountForm = new FormControl<AccountRequest | null>(null);

  onSubmit(): void {
    if (this.createAccountForm.invalid) {
      this.accountForm()?.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.accountService
      .create(this.createAccountForm.getRawValue()!)
      .subscribe({
        next: () => {
          this.toast.success({ message: 'Cuenta creada exitosamente' });
          this.router.navigate(['/cuentas']);
        },
        error: () => this.saving.set(false),
      });
  }
}
