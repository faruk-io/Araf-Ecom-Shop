import { HttpInterceptorFn } from '@angular/common/http';

// Angular's HttpClient does NOT send cookies cross-origin by default.
// This is the piece that makes the ASP.NET Core cookie-based staff auth
// actually work when the Angular dev server (localhost:4200) talks to the
// API (localhost:5001) — without it, `eons_sess` never reaches the API and
// every staff-only call 401s even right after a successful login.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
