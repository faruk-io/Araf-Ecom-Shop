export interface CartItem {
  id: number;      // product id
  name: string;
  price: number;
  qty: number;
  stock: number;   // to cap qty client-side; server re-validates on checkout
  image: string;
}

// Matches shared.php::order_row_to_json() output exactly.
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;              // this is the order CODE, e.g. "EON100001"
  name: string;
  phone: string;
  addr: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  deliveryZone: string;
  deliveryCharge: number;
  coupon: string | null;
  discount: number;
  total: number;
  status: 'pending' | 'approved' | 'cancelled';
  delivery: string | null;
  riderName: string;
  riderPhone: string;
  riderAssignedAt: string | null;
  settled: boolean;
  settledOutcome: string | null;
  placedAt: string | null;
  approvedAt: string | null;
  cancelledAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  settledAt: string | null;
}

// Body for POST /api/orders (checkout)
export interface PlaceOrderRequest {
  name: string;
  phone: string;
  addr: string;
  note?: string;
  zone: string;
  coupon?: string;
  items: { id: number; qty: number }[];
}

// Body for staff order actions: approve/cancel/reopen/delivery/rider/settle/reopenSettled
export interface StaffOrderActionRequest {
  action: 'approve' | 'cancel' | 'reopen' | 'delivery' | 'rider' | 'settle' | 'reopenSettled';
  id: string;      // order CODE, e.g. "EON100001"
  value?: string;  // delivery status, when action === 'delivery'
  name?: string;   // rider name, when action === 'rider'
  phone?: string;  // rider phone, when action === 'rider'
}

export const DELIVERY_STATES = ['Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled', 'Missing'] as const;
