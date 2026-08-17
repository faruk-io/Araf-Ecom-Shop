import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { BannerService } from '../../core/services/banner.service';
import { StoreService } from '../../core/services/store.service';
import { ProductService } from '../../core/services/product.service';

// Mirrors renderBanners()/goSlide()/startSlider() from the original app:
// a fade-crossfade slider when staff-configured banners are active, falling
// back to a static hero (store tagline) when there are none.
@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  banners = inject(BannerService);
  store = inject(StoreService);
  private products = inject(ProductService);

  slideIdx = signal(0);
  hasBanners = computed(() => this.banners.banners().length > 0);
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
  effect(() => {
    const count = this.banners.banners().length;
    if (count >= 2) this.start(); else this.stop();
  });
}

  ngOnInit(): void {
    this.banners.load();
    this.store.load();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  goSlide(i: number): void {
    const n = this.banners.banners().length;
    if (n === 0) return;
    this.slideIdx.set(((i % n) + n) % n);
  }

  step(d: number): void {
    this.goSlide(this.slideIdx() + d);
    this.start();
  }

  start(): void {
    this.stop();
    if (this.banners.banners().length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.timer = setInterval(() => this.goSlide(this.slideIdx() + 1), 5500);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }

  cta(banner: { ctaCat: string }): void {
    if (banner.ctaCat) this.products.filterCat(banner.ctaCat);
    else document.getElementById('shop-top')?.scrollIntoView({ behavior: 'smooth' });
  }
}
