import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product, ProductSaveRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // Signal-based state (Angular 20 style) instead of a BehaviorSubject.
  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly categories = computed(() => {
    const set = new Set(this._products().map(p => p.cat));
    return Array.from(set);
  });

  // Mirrors the original app's activeCat/activeSub/searchQuery + matchesSearch()/visibleProducts().
  readonly activeCat = signal('All');
  readonly activeSub = signal<string | null>(null);
  readonly searchQuery = signal('');

  readonly visibleProducts = computed(() => {
    const cat = this.activeCat();
    const sub = this.activeSub();
    const q = this.searchQuery().trim().toLowerCase();
    return this._products().filter(p => {
      if (p.stock <= 0) return false; // AUTO-HIDE: only in-stock items, same as the original
      if (cat !== 'All' && p.cat !== cat) return false;
      if (sub && p.sub !== sub) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) ||
                 p.cat.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q))) return false;
      return true;
    });
  });

  filterCat(cat: string): void { this.activeCat.set(cat); this.activeSub.set(null); }
  filterSub(cat: string, sub: string): void { this.activeCat.set(cat); this.activeSub.set(sub); }

  // GET /api/products — mirrors products.php's GET branch (all_products()).
  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Product[]>(`${this.base}/products`).subscribe({
      next: (data) => { this._products.set(data); this._loading.set(false); },
      error: () => {
        this._error.set("Can't load the store. Check the API connection.");
        this._loading.set(false);
      }
    });
  }

  byId(id: number): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  // Staff-only — requires the auth cookie (see AuthService); the API enforces
  // this server-side via [Authorize(Roles = "staff")] regardless.
  save(req: ProductSaveRequest) {
    return this.http.post<{ ok: boolean; id: number }>(`${this.base}/products`, req);
  }

  updateStock(id: number, stock: number) {
    return this.http.post<{ ok: boolean }>(`${this.base}/products`, { action: 'stock', id, stock });
  }

  delete(id: number) {
    return this.http.post<{ ok: boolean }>(`${this.base}/products`, { action: 'delete', id });
  }
}
