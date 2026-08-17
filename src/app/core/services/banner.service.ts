import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Banner } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // Public storefront view — active banners only (hero slider).
  readonly banners = signal<Banner[]>([]);
  load(): void {
    this.http.get<{ banners: Banner[] }>(`${this.base}/banners`)
      .subscribe(res => this.banners.set(res.banners.filter(b => b.active)));
  }

  // Staff view — every banner, active or not. Kept in a SEPARATE signal from
  // the public one above so the admin page and the live hero slider (which
  // could both be instantiated in the same app session) never clobber each
  // other's data.
  readonly staffBanners = signal<Banner[]>([]);
  loadAllForStaff(): void {
    this.http.get<{ banners: Banner[] }>(`${this.base}/banners`)
      .subscribe(res => this.staffBanners.set(res.banners));
  }

  save(payload: { id?: number; image: string; title: string; subtitle: string; ctaText: string; ctaCat: string; active: boolean }) {
    return this.http.post<{ ok: boolean; id: number; banners: Banner[] }>(
      `${this.base}/banners`, { action: 'save', ...payload }
    );
  }

  toggle(id: number) {
    return this.http.post<{ ok: boolean; banners: Banner[] }>(`${this.base}/banners`, { action: 'toggle', id });
  }

  delete(id: number) {
    return this.http.post<{ ok: boolean; banners: Banner[] }>(`${this.base}/banners`, { action: 'delete', id });
  }

  move(id: number, dir: -1 | 1) {
    return this.http.post<{ ok: boolean; banners: Banner[] }>(`${this.base}/banners`, { action: 'move', id, dir });
  }
}
