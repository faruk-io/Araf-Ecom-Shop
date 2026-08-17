import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StoreInfo } from '../models/store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  readonly info = signal<StoreInfo | null>(null);

  load(): void {
    this.http.get<StoreInfo>(`${this.base}/settings`).subscribe(s => this.info.set(s));
  }

  // Uses the same "hasWa/hasTel" gating as the original: don't show a
  // floating button until a real (non-placeholder) number is set.
  whatsappHref(): string | null {
    const wa = this.info()?.whatsapp ?? '';
    const digits = wa.replace(/\D/g, '');
    return (digits.length >= 12 && !wa.includes('X')) ? `https://wa.me/${digits}` : null;
  }

  callHref(): string | null {
    const phone = this.info()?.store_phone ?? '';
    const digits = phone.replace(/\D/g, '');
    return (digits.length >= 10 && !phone.includes('X')) ? `tel:${digits}` : null;
  }
}
