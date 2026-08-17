import { Component, OnInit, inject } from '@angular/core';
import { StoreService } from '../../core/services/store.service';

// Real SVG icons instead of emoji (💬/📞) — emoji render inconsistently
// across OS/browser (different glyph, different weight, sometimes tiny),
// which is why these didn't match eonsbd.com's clean branded look. The
// WhatsApp glyph below is the standard official brand mark.
@Component({
  selector: 'app-floating-contact',
  standalone: true,
  template: `
    <div class="float-contact">
      @if (store.whatsappHref(); as href) {
        <a [href]="href" target="_blank" rel="noopener" data-label="Chat on WhatsApp" aria-label="Chat on WhatsApp" class="float-wa">
          <svg class="ico" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.42.688 4.68 1.879 6.6L3 29l7.086-2.34a12.44 12.44 0 0 0 5.915 1.505h.005c6.905 0 12.5-5.596 12.5-12.5S22.906 3 16.001 3Zm0 22.79h-.004a10.34 10.34 0 0 1-5.27-1.444l-.378-.225-3.933 1.298 1.317-3.834-.246-.393a10.29 10.29 0 0 1-1.578-5.492c0-5.696 4.635-10.33 10.335-10.33 5.698 0 10.33 4.634 10.33 10.334 0 5.698-4.632 10.086-10.573 10.086Zm5.663-7.735c-.31-.155-1.833-.905-2.117-1.008-.284-.104-.491-.155-.698.155-.207.31-.802 1.008-.983 1.216-.181.207-.362.233-.672.078-.31-.155-1.31-.483-2.495-1.54-.922-.822-1.545-1.838-1.726-2.148-.181-.31-.02-.478.136-.633.14-.14.31-.362.465-.543.155-.181.207-.31.31-.517.104-.207.052-.388-.026-.543-.078-.155-.698-1.682-.957-2.303-.252-.605-.508-.523-.698-.533-.181-.008-.388-.01-.595-.01-.207 0-.543.078-.828.388-.284.31-1.086 1.061-1.086 2.588 0 1.527 1.112 3.003 1.267 3.21.155.207 2.19 3.345 5.309 4.69.742.32 1.32.512 1.772.655.744.237 1.421.203 1.957.123.597-.089 1.833-.75 2.092-1.474.259-.724.259-1.345.181-1.474-.078-.13-.284-.207-.595-.362Z"/>
          </svg>
        </a>
      }
      @if (store.callHref(); as href) {
        <a [href]="href" data-label="Call us now" aria-label="Call us" class="float-call">
          <svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>
          </svg>
        </a>
      }
    </div>
  `,
  styleUrl: './floating-contact.scss'
})
export class FloatingContactComponent implements OnInit {
  store = inject(StoreService);
  ngOnInit(): void { this.store.load(); }
}
