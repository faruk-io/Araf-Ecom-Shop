export type PageKey = 'about' | 'delivery' | 'return' | 'terms';

export interface ContentPage {
  key: PageKey;
  body: string;
}

export const PAGE_TITLES: Record<PageKey, string> = {
  about: 'About Us',
  delivery: 'Delivery Rules',
  return: 'Return Policy',
  terms: 'Terms & Conditions'
};
