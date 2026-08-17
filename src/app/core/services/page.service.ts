import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ContentPage, PageKey } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PageService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  get(key: PageKey) {
    return this.http.get<ContentPage>(`${this.base}/pages`, { params: { key } });
  }
}
