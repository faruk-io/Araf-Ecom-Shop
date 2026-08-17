import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header';
import { FooterComponent } from './shared/layout/footer';
import { FloatingContactComponent } from './shared/layout/floating-contact';
import { AnnounceBarComponent } from './shared/layout/announce-bar';
import { CartDrawerComponent } from './shared/cart-drawer/cart-drawer';
import { CategoryService } from './core/services/category.service';
import { StoreService } from './core/services/store.service';
import { BannerService } from './core/services/banner.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FloatingContactComponent, AnnounceBarComponent, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private cats = inject(CategoryService);
  private store = inject(StoreService);
  private banners = inject(BannerService);

  // Loaded once here (not per-component) so the nav dropdown, hero, and
  // footer all share the same up-to-date signals regardless of which page
  // mounts first — same intent as the original app's single bootstrap() call.
  ngOnInit(): void {
    this.cats.load();
    this.store.load();
    this.banners.load();
  }
}
