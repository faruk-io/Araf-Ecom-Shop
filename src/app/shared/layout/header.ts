import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  cart = inject(CartService);
  cats = inject(CategoryService);
  products = inject(ProductService);
  private router = inject(Router);

  searchOpen = signal(false);
  openDropdown = signal<string | null>(null);

  // Mobile hamburger menu — separate from the desktop hover-dropdown above
  // (that one is hidden entirely under 820px via CSS). mobileExpanded
  // tracks which category's subcategory accordion is open, since a
  // hover-dropdown doesn't make sense on a touch device.
  mobileMenuOpen = signal(false);
  mobileExpanded = signal<string | null>(null);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
    this.mobileExpanded.set(null);
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.mobileExpanded.set(null);
  }
  toggleMobileExpand(name: string): void {
    this.mobileExpanded.set(this.mobileExpanded() === name ? null : name);
  }

  toggleSearch(force?: boolean): void {
    this.searchOpen.set(force ?? !this.searchOpen());
  }

  onSearchInput(value: string): void {
    this.products.searchQuery.set(value);
    if (value) this.goShop();
  }

  toggleDropdown(name: string): void {
    this.openDropdown.set(this.openDropdown() === name ? null : name);
  }

  filterCat(cat: string): void {
    this.products.filterCat(cat);
    this.openDropdown.set(null);
    this.closeMobileMenu();
    this.goShop();
  }

  filterSub(cat: string, sub: string): void {
    this.products.filterSub(cat, sub);
    this.openDropdown.set(null);
    this.closeMobileMenu();
    this.goShop();
  }

  private goShop(): void {
    if (this.router.url !== '/') this.router.navigateByUrl('/');
  }
}
