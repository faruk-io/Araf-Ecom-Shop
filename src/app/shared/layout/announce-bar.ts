import { Component, inject, computed } from '@angular/core';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'app-announce-bar',
  standalone: true,
  template: `
    @if (text()) {
      <div class="announce">{{ text() }}</div>
    }
  `,
  styles: [`
    .announce {
      background: var(--ink);
      color: #d9e2f6;
      text-align: center;
      font-size: .78rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      padding: 8px;
    }
  `]
})
export class AnnounceBarComponent {
  private store = inject(StoreService);
  // Same fallback text as the original announceBar element.
  text = computed(() =>
    this.store.info()?.announce ||
    '100% genuine products · Official warranty · Every order confirmed by a quick call'
  );
}
