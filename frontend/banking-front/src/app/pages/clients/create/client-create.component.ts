import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientRequest } from '@core/interface';
import { ClientService } from '@core/services/client/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { ClientFormComponent } from '../components/client-form.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-client-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ClientFormComponent,
    RouterLink,
    ButtonComponent,
    ClickTrackingDirective,
    IconComponent,
  ],
  templateUrl: './client-create.component.html',
  styleUrl: './client-create.component.scss',
})
export class ClientCreateComponent {
  private readonly clientForm = viewChild(ClientFormComponent);

  private readonly clientService = inject(ClientService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly createClientForm = new FormControl<ClientRequest | null>(null);

  onSubmit(): void {
    if (this.createClientForm.invalid) {
      this.clientForm()?.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.clientService.create(this.createClientForm.getRawValue()!).subscribe({
      next: () => {
        this.toast.success({ message: 'Cliente creado exitosamente' });
        this.router.navigate(['/clientes']);
      },
      error: () => this.saving.set(false),
    });
  }
}
