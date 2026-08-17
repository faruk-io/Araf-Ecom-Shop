import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Protects /staff/** routes. Always re-checks with the server (via the
// httponly cookie) rather than trusting client state, same trust boundary
// as require_staff() in the PHP version — the client-side check is just UX,
// the API re-validates on every staff-only call regardless.
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map(res => {
      auth.staff.set(res.staff);
      return res.staff ? true : router.createUrlTree(['/staff/login']);
    }),
    catchError(() => of(router.createUrlTree(['/staff/login'])))
  );
};
