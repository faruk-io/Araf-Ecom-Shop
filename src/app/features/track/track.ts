import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { StoreService } from '../../core/services/store.service';
import { Order } from '../../core/models/order.model';

type StepState = 'done' | 'active' | 'upcoming';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './track.html',
  styleUrl: './track.scss'
})
export class TrackComponent implements OnInit {
  private orders = inject(OrderService);
  private route = inject(ActivatedRoute);
  store = inject(StoreService);

  code = signal('');
  order = signal<Order | null>(null);
  notFound = signal(false);
  loading = signal(false);

  ngOnInit(): void {
    this.store.load();
    const fromQuery = this.route.snapshot.queryParamMap.get('id');
    if (fromQuery) {
      this.code.set(fromQuery);
      this.search();
    }
  }

  search(): void {
    const c = this.code().trim();
    if (!c) return;
    this.loading.set(true);
    this.notFound.set(false);
    this.order.set(null);
    this.orders.track(c).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: () => { this.notFound.set(true); this.loading.set(false); }
    });
  }

  // ---- status banner + stepper, derived from order.status/delivery ----

  banner = computed(() => {
    const o = this.order();
    if (!o) return { text: '', tone: 'neutral' as const };

    if (o.status === 'cancelled') return { text: 'This order was cancelled.', tone: 'muted' as const };
    if (o.status === 'pending') return { text: "We're confirming your order", tone: 'amber' as const };

    switch (o.delivery) {
      case 'Delivered': return { text: 'Delivered — enjoy!', tone: 'green' as const };
      case 'Shipped': return { text: 'Out for delivery', tone: 'blue' as const };
      case 'Returned': return { text: 'This order was returned.', tone: 'muted' as const };
      case 'Missing': return { text: "We're looking into this delivery — please contact us.", tone: 'red' as const };
      default: return { text: 'Your order is confirmed and being prepared', tone: 'blue' as const };
    }
  });

  // Step 1 "Order confirmed", 2 "Out for delivery", 3 "Delivered".
  stepStates = computed<[StepState, StepState, StepState]>(() => {
    const o = this.order();
    if (!o) return ['upcoming', 'upcoming', 'upcoming'];
    if (o.status === 'cancelled' || o.delivery === 'Returned' || o.delivery === 'Missing') {
      return ['done', 'upcoming', 'upcoming'];
    }
    if (o.status === 'pending') return ['active', 'upcoming', 'upcoming'];
    if (o.delivery === 'Delivered') return ['done', 'done', 'done'];
    if (o.delivery === 'Shipped') return ['done', 'active', 'upcoming'];
    return ['done', 'upcoming', 'upcoming']; // approved, still Processing
  });

  placedAtFormatted = computed(() => {
    const iso = this.order()?.placedAt;
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  });
}
