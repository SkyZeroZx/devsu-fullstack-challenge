import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MovementRequest } from '@core/interface';
import { MovementService } from '@core/services/movement/movement.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { MovementFormComponent } from '../components/movement-form.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-movement-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MovementFormComponent,
    RouterLink,
    ButtonComponent,
    ClickTrackingDirective,
    IconComponent,
  ],
  templateUrl: './movement-create.component.html',
  styleUrl: './movement-create.component.scss',
})
export class MovementCreateComponent {
  private readonly movementForm = viewChild(MovementFormComponent);

  private readonly movementService = inject(MovementService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly formCtrl = new FormControl<MovementRequest | null>(null);

  onSubmit(): void {
    if (this.formCtrl.invalid) {
      this.movementForm()?.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.movementService.create(this.formCtrl.value!).subscribe({
      next: () => {
        this.toast.success({ message: 'Movimiento registrado exitosamente' });
        this.router.navigate(['/movimientos']);
      },
      error: () => this.saving.set(false),
    });
  }
}
