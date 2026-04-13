import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { ButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);

  readonly user = this.auth.user;

  logout(): void {
    this.analytics.trackEvent('logout');
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
