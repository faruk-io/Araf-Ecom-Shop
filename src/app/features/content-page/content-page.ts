import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageService } from '../../core/services/page.service';
import { PAGE_TITLES, PageKey } from '../../core/models/page.model';

// Mirrors openPage(): paragraphs split on blank lines, text only (escaped
// server-side already by the fact that we bind via {{ }} interpolation,
// never innerHTML) — same safety property as the original's escapeHtml().
@Component({
  selector: 'app-content-page',
  standalone: true,
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss'
})
export class ContentPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pages = inject(PageService);

  key = signal<PageKey>('about');
  title = signal('');
  paragraphs = signal<string[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const k = (params.get('key') as PageKey) || 'about';
      this.key.set(k);
      this.title.set(PAGE_TITLES[k] ?? 'Page');
      this.loading.set(true);
      this.pages.get(k).subscribe({
        next: res => {
          const text = (res.body || '').trim();
          this.paragraphs.set(text ? text.split(/\n{2,}/) : []);
          this.loading.set(false);
        },
        error: () => { this.paragraphs.set([]); this.loading.set(false); }
      });
    });
  }
}
