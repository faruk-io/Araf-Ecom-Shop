import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Order, PlaceOrderRequest, StaffOrderActionRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  placeOrder(req: PlaceOrderRequest) {
    return this.http.post<{ ok: boolean; order: Order; stocks: { id: number; stock: number }[] }>(
      `${this.base}/orders`, req
    );
  }

  // GET /api/orders?id=CODE — mirrors track.php's public lookup.
  // The API returns the order object directly on 200 (not wrapped), and a
  // 404 with {error} when the code doesn't exist — that 404 surfaces
  // through the Observable's error channel, not a null "order" field.
  track(code: string) {
    return this.http.get<Order>(`${this.base}/orders`, { params: { id: code } });
  }

  // GET /api/orders (no id) — staff-only, returns the full order list.
  getAll() {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  // POST /api/orders {action, id, ...} — staff-only status-pipeline actions.
  staffAction(req: StaffOrderActionRequest) {
    return this.http.post<{ ok: boolean; order: Order; stocks: { id: number; stock: number }[] }>(
      `${this.base}/orders`, req
    );
  }
}
