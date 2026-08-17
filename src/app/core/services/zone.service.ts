import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DeliveryZone } from '../models/zone.model';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  readonly zones = signal<DeliveryZone[]>([]);
  private loaded = false;

  load(): void {
    if (this.loaded) return; // zones rarely change — fetch once per session
    this.loaded = true;
    this.http.get<DeliveryZone[]>(`${this.base}/zones`).subscribe(z => this.zones.set(z));
  }
}
