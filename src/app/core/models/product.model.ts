// Field names match ProductDto from the ASP.NET Core API 1:1
// (which itself matches shared.php::all_products() from the original PHP).
export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  at: string | null;
}

export interface Product {
  id: number;
  name: string;
  cat: string;
  sub: string;
  desc: string;
  price: number;
  old: number;
  stock: number;
  images: string[];
  reviews: Review[];
}

// Body for POST /api/products (create/update) — mirrors ProductSaveRequest
export interface ProductSaveRequest {
  id?: number;
  name: string;
  cat: string;
  sub: string;
  desc?: string;
  price: number;
  old: number;
  stock: number;
  images?: string[];
}
