import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  templateUrl: './staff-login.html',
  styleUrl: './staff-login.scss'
})
export class StaffLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  passcode = signal('');
  error = signal<string | null>(null);
  submitting = signal(false);

  submit(): void {
    const pass = this.passcode().trim();
    if (!pass) return;
    this.submitting.set(true);
    this.error.set(null);

    this.auth.login(pass).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if ('ok' in res && res.ok) {
          this.auth.staff.set(true);
          this.router.navigateByUrl('/staff/dashboard');
        } else {
          this.error.set('error' in res ? res.error : 'Incorrect passcode');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.error ?? 'Incorrect passcode');
      }
    });
  }
}
