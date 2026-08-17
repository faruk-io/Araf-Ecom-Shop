import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

// Note: the original index.html doesn't persist the cart to localStorage
// either — it's in-memory for the browser tab's lifetime. Kept identical
// here rather than "improving" it, per the migration goal of same behavior.
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.qty, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));

  // Drawer open/close state — the "Your bag" / "Confirm your order" /
  // "Order placed" panel is one overlay component (CartDrawerComponent)
  // that any part of the app (header's Bag button, "Add to cart" clicks)
  // can trigger via these two methods, rather than routing to /cart.
  readonly isOpen = signal(false);
  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  // Coupon state lives here (not just in the checkout step) since the
  // subtotal display in the bag view also reacts to it, same as the
  // original's coupon field sitting inside the bag drawer itself.
  readonly couponCode = signal('');
  readonly couponDiscount = signal(0);
  readonly couponError = signal<string | null>(null);

  readonly total = computed(() => Math.max(0, this.subtotal() - this.couponDiscount()));

  clearCoupon(): void {
    this.couponCode.set('');
    this.couponDiscount.set(0);
    this.couponError.set(null);
  }

  // Toggles true briefly on every add() so the header's cart badge can
  // replay its bounce animation. A plain incrementing counter wouldn't
  // work here — [class.bounce] binds to truthiness, and once a number
  // signal goes non-zero it stays truthy forever, so the CSS animation
  // would only ever fire on the very first add. This resets itself back
  // to false shortly after each add, so re-adding always retriggers it.
  readonly bounceActive = signal(false);
  private bumpBounce(): void {
    this.bounceActive.set(false);
    setTimeout(() => this.bounceActive.set(true), 0);
    setTimeout(() => this.bounceActive.set(false), 450);
  }

  add(product: Product, qty = 1): void {
    const existing = this._items().find(i => i.id === product.id);
    const cap = product.stock;
    if (existing) {
      const nextQty = Math.min(existing.qty + qty, cap);
      this._items.update(list => list.map(i => i.id === product.id ? { ...i, qty: nextQty } : i));
    } else {
      this._items.update(list => [...list, {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: Math.min(qty, cap),
        stock: cap,
        image: product.images[0] ?? ''
      }]);
    }
    this.bumpBounce();
    this.open(); // matches the original: adding an item pops the bag drawer open
  }

  setQty(productId: number, qty: number): void {
    if (qty <= 0) { this.remove(productId); return; }
    this._items.update(list => list.map(i =>
      i.id === productId ? { ...i, qty: Math.min(qty, i.stock) } : i));
  }

  remove(productId: number): void {
    this._items.update(list => list.filter(i => i.id !== productId));
  }

  clear(): void {
    this._items.set([]);
    this.clearCoupon();
  }
}
