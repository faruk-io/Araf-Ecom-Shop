import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CouponValidateResponse {
  ok: true;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  min_spend: number;
  discount: number;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // Mirrors coupons.php's public "validate" action.
  validate(code: string, subtotal: number) {
    return this.http.post<CouponValidateResponse>(`${this.base}/coupons`, { action: 'validate', code, subtotal });
  }
}
