// Matches BannersController's GET /api/banners shape
export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaCat: string;
  sort: number;
  active: boolean;
}
