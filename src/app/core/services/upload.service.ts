import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UploadPurpose = 'banner' | 'category' | 'product';

interface UploadResponse {
  ok: boolean;
  url: string; // relative, e.g. "uploads/product-202608-abc123.jpg"
  width: number;
  height: number;
  bytes: number;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  // Mirrors upload.php: staff-only, multipart POST, server resizes/re-encodes.
  // Returns a full absolute URL (https://…/uploads/xxx.jpg) — the relative
  // path the API hands back only resolves correctly against the API's own
  // origin, not Angular's (they're on different ports), so this is the
  // form every other part of the app (product.images, banners, etc.)
  // should actually store and render.
  upload(file: File, purpose: UploadPurpose): Observable<string> {
    const form = new FormData();
    form.append('image', file);
    form.append('purpose', purpose);

    return this.http.post<UploadResponse>(`${environment.apiBase}/upload`, form).pipe(
      map(res => `${environment.apiOrigin}/${res.url}`)
    );
  }
}
