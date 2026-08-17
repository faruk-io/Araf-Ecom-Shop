import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  products = inject(ProductService);
  cart = inject(CartService);
  private fly = inject(FlyToCartService);

  private productId = signal(0);
  product = computed(() =>
    this.products.products().find(p => p.id === this.productId())
  );

  justAdded = signal(false);

  ngOnInit(): void {
    this.productId.set(Number(this.route.snapshot.paramMap.get('id')));
    // If the user landed here directly (refresh / shared link), the product
    // list signal may still be empty — load it; `product` recomputes once it lands.
    if (this.products.products().length === 0) this.products.load();
  }

  addToCart(event: Event): void {
    const p = this.product();
    if (!p) return;

    const container = (event.currentTarget as HTMLElement).closest('.detail');
    const img = container?.querySelector('.main-img') as HTMLImageElement | null;
    if (img) this.fly.fly(img, () => this.cart.add(p));
    else this.cart.add(p);

    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1100);
  }
}
