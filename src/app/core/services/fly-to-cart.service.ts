import { Injectable } from '@angular/core';

// Clones a product image and animates it flying from its on-screen
// position into the header's cart icon — the classic "add to bag" motion
// (matches the effect on eonsbd.com). Pure DOM/CSS, no Angular Animations
// module needed: a fixed-position clone, one transform transition, removed
// on transitionend.
@Injectable({ providedIn: 'root' })
export class FlyToCartService {
  fly(sourceEl: HTMLElement, onArrive?: () => void): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onArrive?.(); return; }

    const target = document.getElementById('cart-fly-target');
    if (!target) { onArrive?.(); return; } // header not mounted yet — just skip the effect, don't block adding

    const srcRect = sourceEl.getBoundingClientRect();
    const dstRect = target.getBoundingClientRect();
    if (srcRect.width === 0 || srcRect.height === 0) { onArrive?.(); return; }

    const clone = document.createElement('div');
    const bg = getComputedStyle(sourceEl).backgroundImage;
    const isImg = sourceEl.tagName === 'IMG';

    Object.assign(clone.style, {
      position: 'fixed',
      left: `${srcRect.left}px`,
      top: `${srcRect.top}px`,
      width: `${srcRect.width}px`,
      height: `${srcRect.height}px`,
      borderRadius: '10px',
      overflow: 'hidden',
      zIndex: '200',
      pointerEvents: 'none',
      transition: 'transform .55s cubic-bezier(.35,0,.25,1), opacity .55s ease',
      willChange: 'transform, opacity',
      boxShadow: '0 8px 24px rgba(24,31,59,.25)'
    } as CSSStyleDeclaration);

    if (isImg) {
      clone.style.backgroundImage = `url(${(sourceEl as HTMLImageElement).src})`;
      clone.style.backgroundSize = 'cover';
      clone.style.backgroundPosition = 'center';
    } else if (bg && bg !== 'none') {
      clone.style.backgroundImage = bg;
      clone.style.backgroundSize = 'cover';
      clone.style.backgroundPosition = 'center';
    }

    document.body.appendChild(clone);

    // Force a reflow so the browser registers the starting position
    // before we change it — otherwise the transition never plays.
    void clone.getBoundingClientRect();

    const dx = dstRect.left + dstRect.width / 2 - (srcRect.left + srcRect.width / 2);
    const dy = dstRect.top + dstRect.height / 2 - (srcRect.top + srcRect.height / 2);
    const scale = Math.max(0.08, dstRect.width / srcRect.width);

    clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    clone.style.opacity = '0.3';

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clone.remove();
      onArrive?.();
    };
    clone.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 700); // safety net in case transitionend doesn't fire
  }
}
