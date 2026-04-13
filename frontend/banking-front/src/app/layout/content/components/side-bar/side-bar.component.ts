import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  readonly links = [
    { path: '/clientes', label: 'Clientes', icon: 'people' },
    { path: '/cuentas', label: 'Cuentas', icon: 'account_balance' },
    { path: '/movimientos', label: 'Movimientos', icon: 'swap_horiz' },
    { path: '/reportes', label: 'Reportes', icon: 'bar_chart' },
  ];
}
