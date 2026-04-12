import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';

export function onRouterNavigateClean(callback: () => void) {
  const router = inject(Router);
  const routerEvents$ = router.events.pipe(
    filter((event) => event instanceof NavigationStart),
    takeUntilDestroyed(),
  );

  routerEvents$.subscribe(() => {
    callback();
  });
}
