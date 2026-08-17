import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { catIconPath } from '../../core/utils/cat-icon';

// Mirrors renderCatTiles() — a swipeable row of circular category tiles
// under the hero. Icons are real inline SVG (not emoji): emoji glyphs
// render inconsistently across OSes — several category icons (laptop,
// wrench, wifi, plug) fall back to Windows' monochrome "Segoe UI Symbol"
// font, which stays visually tiny regardless of font-size. SVG scales
// exactly and consistently everywhere, so it's the correct fix, not just a
// style preference.
@Component({
  selector: 'app-category-tiles',
  standalone: true,
  templateUrl: './category-tiles.html',
  styleUrl: './category-tiles.scss'
})
export class CategoryTilesComponent implements OnInit {
  cats = inject(CategoryService);
  products = inject(ProductService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.cats.load();
  }

  pick(name: string): void {
    this.products.filterCat(name);
  }

  // Returns the inner <path>/<rect>/... markup for this category, or ''
  // if nothing matched (component falls back to the first-letter tile).
  iconSvg(name: string): SafeHtml | null {
    const path = catIconPath(name);
    return path ? this.sanitizer.bypassSecurityTrustHtml(path) : null;
  }

  hasIcon(name: string): boolean {
    return catIconPath(name) !== '';
  }
}
