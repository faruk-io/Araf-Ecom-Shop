import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { UploadService } from '../../../core/services/upload.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductSaveRequest } from '../../../core/models/product.model';

@Component({
  selector: 'app-staff-products',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './staff-products.html',
  styleUrl: './staff-products.scss'
})
export class StaffProductsComponent implements OnInit {
  products = inject(ProductService);
  private upload = inject(UploadService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Editor panel state — null means the list view, otherwise this holds
  // either an existing product being edited or a blank draft for "Add new".
  editing = signal<ProductSaveRequest | null>(null);
  editingImages = signal<string[]>([]);
  uploadingCount = signal(0);
  saving = signal(false);
  errorMsg = signal<string | null>(null);
  search = signal('');

  ngOnInit(): void {
    this.products.load();
  }

  logout(): void {
    this.auth.logout().subscribe(() => { this.auth.staff.set(false); this.router.navigateByUrl('/staff/login'); });
  }

  filteredList(): Product[] {
    const q = this.search().trim().toLowerCase();
    const all = this.products.products();
    if (!q) return all;
    return all.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  }

  openNew(): void {
    this.errorMsg.set(null);
    this.editing.set({ name: '', cat: '', sub: '', desc: '', price: 0, old: 0, stock: 0, images: [] });
    this.editingImages.set([]);
  }

  openEdit(p: Product): void {
    this.errorMsg.set(null);
    this.editing.set({
      id: p.id, name: p.name, cat: p.cat, sub: p.sub, desc: p.desc,
      price: p.price, old: p.old, stock: p.stock, images: [...p.images]
    });
    this.editingImages.set([...p.images]);
  }

  closeEditor(): void {
    this.editing.set(null);
    this.editingImages.set([]);
  }

  onFilesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      this.uploadingCount.update(n => n + 1);
      this.upload.upload(file, 'product').subscribe({
        next: (url) => {
          this.editingImages.update(list => [...list, url]);
          this.uploadingCount.update(n => n - 1);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.error ?? 'Image upload failed.');
          this.uploadingCount.update(n => n - 1);
        }
      });
    }
    (event.target as HTMLInputElement).value = ''; // allow re-selecting the same file
  }

  removeImage(url: string): void {
    this.editingImages.update(list => list.filter(u => u !== url));
  }

  save(): void {
    const req = this.editing();
    if (!req) return;
    if (!req.name.trim()) { this.errorMsg.set('Product name is required'); return; }

    this.saving.set(true);
    this.errorMsg.set(null);
    const payload: ProductSaveRequest = { ...req, images: this.editingImages() };

    this.products.save(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeEditor();
        this.products.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.error ?? 'Could not save the product.');
      }
    });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    this.products.delete(p.id).subscribe(() => this.products.load());
  }

  quickStock(p: Product, value: string): void {
    const n = Math.max(0, parseInt(value, 10) || 0);
    this.products.updateStock(p.id, n).subscribe(() => this.products.load());
  }
}
