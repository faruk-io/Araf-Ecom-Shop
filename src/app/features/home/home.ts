import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { HeroComponent } from '../../shared/layout/hero';
import { CategoryTilesComponent } from '../../shared/layout/category-tiles';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe, HeroComponent, CategoryTilesComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  products = inject(ProductService);
  cart = inject(CartService);
  private fly = inject(FlyToCartService);

  // Product id currently showing the "✓ Added" button state (briefly, per
  // click) — a Set so multiple quick clicks on different cards can each
  // show their own feedback independently.
  justAdded = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.products.load();
  }

  addToCart(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const product = this.products.byId(id);
    if (!product) return;

    // Animate the card's own <img> flying to the header cart icon, then
    // add to the cart once it "arrives" — the visual and the actual cart
    // update land at the same moment.
    const card = (event.currentTarget as HTMLElement).closest('.card');
    const img = card?.querySelector('img') as HTMLImageElement | null;
    if (img) this.fly.fly(img, () => this.cart.add(product));
    else this.cart.add(product);

    this.justAdded.update(set => new Set(set).add(id));
    setTimeout(() => {
      this.justAdded.update(set => { const s = new Set(set); s.delete(id); return s; });
    }, 1100);
  }
}
