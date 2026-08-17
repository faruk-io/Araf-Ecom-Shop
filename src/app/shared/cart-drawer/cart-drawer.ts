import { Component, effect, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ZoneService } from '../../core/services/zone.service';
import { CouponService } from '../../core/services/coupon.service';
import { OrderService } from '../../core/services/order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { StoreService } from '../../core/services/store.service';
import { Order, PlaceOrderRequest } from '../../core/models/order.model';

type Step = 'bag' | 'checkout' | 'placed';

// The single overlay panel behind "Your bag" / "Confirm your order" /
// "Order placed" — one drawer that morphs through three steps, matching
// eonsbd.com's flow, instead of separate /cart and /checkout pages.
@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss'
})
export class CartDrawerComponent {
  cart = inject(CartService);
  zones = inject(ZoneService);
  private coupons = inject(CouponService);
  private orders = inject(OrderService);
  private router = inject(Router);
  private invoice = inject(InvoiceService);
  private store = inject(StoreService);

  step = signal<Step>('bag');

  constructor() {
    // zones.load() (called from goToCheckout()) is async — setting the
    // default zone synchronously right after firing it was too early, so
    // zoneName stayed '' while the <select> visually showed the browser's
    // own "first option" fallback. This effect re-fires once the real data
    // lands and fills in the default correctly.
    effect(() => {
      const list = this.zones.zones();
      if (!this.zoneName() && list.length > 0) this.zoneName.set(list[0].name);
    });
  }

  // --- coupon (bag step) ---
  couponInput = signal('');
  couponBusy = signal(false);

  applyCoupon(): void {
    const code = this.couponInput().trim();
    if (!code) return;
    this.couponBusy.set(true);
    this.cart.couponError.set(null);
    this.coupons.validate(code, this.cart.subtotal()).subscribe({
      next: (res) => {
        this.cart.couponCode.set(res.code);
        this.cart.couponDiscount.set(res.discount);
        this.couponBusy.set(false);
      },
      error: (err) => {
        this.cart.couponError.set(err?.error?.error ?? 'That coupon code isn\u2019t valid.');
        this.couponBusy.set(false);
      }
    });
  }
  removeCoupon(): void {
    this.cart.clearCoupon();
    this.couponInput.set('');
  }

  // --- checkout step ---
  name = signal('');
  phone = signal('');
  zoneName = signal('');
  addr = signal('');
  note = signal('');
  submitting = signal(false);
  checkoutError = signal<string | null>(null);

  selectedZoneCharge = computed(() => {
    const z = this.zones.zones().find(z => z.name === this.zoneName());
    return z?.charge ?? 0;
  });
  checkoutTotal = computed(() => this.cart.total() + this.selectedZoneCharge());

  goToCheckout(): void {
    this.zones.load();
    this.step.set('checkout');
  }
  backToBag(): void { this.step.set('bag'); }

  placedOrder = signal<Order | null>(null);

  placeOrder(): void {
    this.submitting.set(true);
    this.checkoutError.set(null);
    const req: PlaceOrderRequest = {
      name: this.name(),
      phone: this.phone(),
      addr: this.addr(),
      note: this.note(),
      zone: this.zoneName(),
      coupon: this.cart.couponCode() || undefined,
      items: this.cart.items().map(i => ({ id: i.id, qty: i.qty }))
    };
    this.orders.placeOrder(req).subscribe({
      next: (res) => {
        this.placedOrder.set(res.order);
        this.cart.clear();
        this.submitting.set(false);
        this.step.set('placed');
      },
      error: (err) => {
        this.checkoutError.set(err?.error?.error ?? 'Could not place the order — please try again.');
        this.submitting.set(false);
      }
    });
  }

  invoiceGenerating = signal(false);

  downloadInvoice(): void {
    const o = this.placedOrder();
    if (!o || this.invoiceGenerating()) return;
    this.invoiceGenerating.set(true);
    this.invoice.generate(o, this.store.info()).finally(() => this.invoiceGenerating.set(false));
  }

  // --- shared ---
  closeAll(): void {
    this.cart.close();
    // Reset back to the bag view for next time, after the close animation
    // has a moment to play, so the user doesn't see it "jump" mid-close.
    setTimeout(() => {
      if (!this.cart.isOpen()) { this.step.set('bag'); this.placedOrder.set(null); }
    }, 200);
  }

  trackOrder(): void {
    const code = this.placedOrder()?.id;
    this.closeAll();
    this.router.navigate(['/track'], code ? { queryParams: { id: code } } : {});
  }
}
