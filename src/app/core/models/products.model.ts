export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  brand?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  categories?: {
    name: string;
  };
}
