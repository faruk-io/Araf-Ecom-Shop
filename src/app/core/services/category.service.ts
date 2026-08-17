import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MenuCategory } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  readonly menu = signal<MenuCategory[]>([]);

  load(): void {
    this.http.get<MenuCategory[]>(`${this.base}/categories`).subscribe(m => this.menu.set(m));
  }
}
