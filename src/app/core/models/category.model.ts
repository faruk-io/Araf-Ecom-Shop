// Matches CategoriesController's GET /api/categories shape:
//   [{ name, image, subs: string[] }]
export interface MenuCategory {
  name: string;
  image: string;
  subs: string[];
}
