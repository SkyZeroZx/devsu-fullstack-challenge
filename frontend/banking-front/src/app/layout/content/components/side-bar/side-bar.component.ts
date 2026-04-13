import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  readonly links = [
    { path: '/clientes', label: 'Clientes' },
    { path: '/cuentas', label: 'Cuentas' },
    { path: '/movimientos', label: 'Movimientos' },
    { path: '/reportes', label: 'Reportes' },
  ];
}
