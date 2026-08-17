import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  readonly staff = signal(false);

  // GET /api/auth -> { staff: bool } — call once on app init to sync
  // signed-in state with the httponly cookie the browser already holds.
  checkSession() {
    return this.http.get<{ staff: boolean }>(`${this.base}/auth`);
  }

  login(passcode: string) {
    return this.http.post<{ ok: boolean; staff: boolean } | { error: string }>(
      `${this.base}/auth`, { passcode }
    );
  }

  logout() {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth`, { action: 'logout' });
  }

  changePass(current: string, next: string) {
    return this.http.post<{ ok: boolean } | { error: string }>(
      `${this.base}/auth`, { action: 'change_pass', current, new: next }
    );
  }
}
