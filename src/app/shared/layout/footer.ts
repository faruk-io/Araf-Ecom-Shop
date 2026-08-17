import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  store = inject(StoreService);
  cats = inject(CategoryService);
  products = inject(ProductService);
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.store.load();
    this.cats.load();
  }

  filterCat(cat: string): void {
    this.products.filterCat(cat);
    if (this.router.url !== '/') this.router.navigateByUrl('/');
  }
}
