import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, DELIVERY_STATES } from '../../../core/models/order.model';

type Tab = 'all' | 'pending' | 'approved' | 'cancelled';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.scss'
})
export class StaffDashboardComponent implements OnInit {
  private orderSvc = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);

  deliveryStates = DELIVERY_STATES;

  orders = signal<Order[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  tab = signal<Tab>('all');
  busyCode = signal<string | null>(null); // disables buttons on the order currently mid-request

  // Rider-form open state per order code, so the name/phone inputs only show
  // when staff clicks "Assign rider" — same idea as the original's inline edit row.
  riderFormFor = signal<string | null>(null);
  riderName = signal('');
  riderPhone = signal('');

  filtered = computed(() => {
    const t = this.tab();
    const list = this.orders();
    if (t === 'all') return list;
    return list.filter(o => o.status === t);
  });

  counts = computed(() => {
    const list = this.orders();
    return {
      all: list.length,
      pending: list.filter(o => o.status === 'pending').length,
      approved: list.filter(o => o.status === 'approved').length,
      cancelled: list.filter(o => o.status === 'cancelled').length
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.orderSvc.getAll().subscribe({
      next: (list) => { this.orders.set(list); this.loading.set(false); },
      error: (err) => {
        this.errorMsg.set(err?.error?.error ?? "Couldn't load orders.");
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.auth.staff.set(false);
      this.router.navigateByUrl('/staff/login');
    });
  }

  // Whether this order is eligible for "Mark settled" — mirrors the exact
  // eligibility check in OrderService.StaffAction's "settle" case on the API.
  canSettle(o: Order): boolean {
    if (o.settled) return false;
    const finalStates = ['Delivered', 'Returned', 'Missing'];
    return o.status === 'cancelled' || (o.status === 'approved' && !!o.delivery && finalStates.includes(o.delivery));
  }

  approve(o: Order): void { this.act(o.id, 'approve'); }
  cancel(o: Order): void { if (confirm(`Cancel order ${o.id}? Stock will be restored.`)) this.act(o.id, 'cancel'); }
  reopen(o: Order): void { this.act(o.id, 'reopen'); }
  settle(o: Order): void { this.act(o.id, 'settle'); }
  reopenSettled(o: Order): void { this.act(o.id, 'reopenSettled'); }

  setDelivery(o: Order, value: string): void {
    this.act(o.id, 'delivery', { value });
  }

  openRiderForm(o: Order): void {
    this.riderFormFor.set(o.id);
    this.riderName.set(o.riderName || '');
    this.riderPhone.set(o.riderPhone || '');
  }
  closeRiderForm(): void { this.riderFormFor.set(null); }

  saveRider(o: Order): void {
    this.act(o.id, 'rider', { name: this.riderName().trim(), phone: this.riderPhone().trim() });
    this.riderFormFor.set(null);
  }
  clearRider(o: Order): void {
    this.act(o.id, 'rider', { name: '', phone: '' });
    this.riderFormFor.set(null);
  }

  private act(code: string, action: string, extra: Record<string, string> = {}): void {
    this.busyCode.set(code);
    this.orderSvc.staffAction({ action: action as any, id: code, ...extra }).subscribe({
      next: (res) => {
        this.orders.update(list => list.map(o => o.id === code ? res.order : o));
        this.busyCode.set(null);
      },
      error: (err) => {
        alert(err?.error?.error ?? 'That action failed — please try again.');
        this.busyCode.set(null);
      }
    });
  }
}
