import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageService } from '../../core/services/page.service';
import { PAGE_TITLES, PageKey } from '../../core/models/page.model';

// Mirrors openPage(key) from the original app: fetches api/pages.php?key=,
// splits the body on blank lines into paragraphs, and shows a friendly
// "hasn't been written yet" placeholder when the page is empty.
@Component({
  selector: 'app-content-page',
  standalone: true,
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss'
})
export class ContentPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pages = inject(PageService);

  title = signal('');
  paragraphs = signal<string[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const key = this.route.snapshot.paramMap.get('key') as PageKey | null;
    if (!key || !(key in PAGE_TITLES)) {
      this.title.set('Page not found');
      this.loading.set(false);
      return;
    }
    this.title.set(PAGE_TITLES[key]);
    this.pages.get(key).subscribe({
      next: (res) => {
        const body = (res.body || '').trim();
        this.paragraphs.set(body ? body.split(/\n{2,}/) : []);
        this.loading.set(false);
      },
      error: () => { this.paragraphs.set([]); this.loading.set(false); }
    });
  }
}
