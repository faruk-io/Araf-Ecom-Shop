import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BannerService } from '../../../core/services/banner.service';
import { CategoryService } from '../../../core/services/category.service';
import { UploadService } from '../../../core/services/upload.service';
import { Banner } from '../../../core/models/banner.model';

interface BannerDraft {
  id?: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaCat: string;
  active: boolean;
}

@Component({
  selector: 'app-staff-banners',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './staff-banners.html',
  styleUrl: './staff-banners.scss'
})
export class StaffBannersComponent implements OnInit {
  banners = inject(BannerService);
  cats = inject(CategoryService);
  private upload = inject(UploadService);

  editing = signal<BannerDraft | null>(null);
  uploading = signal(false);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.banners.loadAllForStaff();
    this.cats.load();
  }

  openNew(): void {
    this.errorMsg.set(null);
    this.editing.set({ image: '', title: '', subtitle: '', ctaText: '', ctaCat: '', active: true });
  }

  openEdit(b: Banner): void {
    this.errorMsg.set(null);
    this.editing.set({ id: b.id, image: b.image, title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaCat: b.ctaCat, active: b.active });
  }

  close(): void { this.editing.set(null); }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.upload.upload(file, 'banner').subscribe({
      next: (url) => {
        const d = this.editing();
        if (d) this.editing.set({ ...d, image: url });
        this.uploading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.error ?? 'Image upload failed.');
        this.uploading.set(false);
      }
    });
    (event.target as HTMLInputElement).value = '';
  }

  save(): void {
    const d = this.editing();
    if (!d) return;
    if (!d.image) { this.errorMsg.set('Upload a banner image first.'); return; }

    this.saving.set(true);
    this.errorMsg.set(null);
    this.banners.save(d).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.banners.staffBanners.set(res.banners);
        this.close();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.error ?? 'Could not save the banner.');
      }
    });
  }

  toggle(b: Banner): void {
    this.banners.toggle(b.id).subscribe(res => this.banners.staffBanners.set(res.banners));
  }

  move(b: Banner, dir: -1 | 1): void {
    this.banners.move(b.id, dir).subscribe(res => this.banners.staffBanners.set(res.banners));
  }

  remove(b: Banner): void {
    if (!confirm('Delete this banner?')) return;
    this.banners.delete(b.id).subscribe(res => this.banners.staffBanners.set(res.banners));
  }
}
