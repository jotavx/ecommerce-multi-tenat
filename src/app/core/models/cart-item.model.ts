import { Product } from './products.model';

// export interface CartItem {
//   id?: string;
//   user_id?: string; // solo si está autenticado
//   product_id: string;
//   quantity: number;
//   product?: Product; // para acceder a nombre, precio, etc.
// }

export interface CartItem {
  id?: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  product?: Product;

  variant_ids?: string[];
  option_ids?: string[];

  total_price?: number;

  selectedVariants?: any[]; // Para uso en frontend
  selectedOptions?: any[];

  observation?: string;
  business_id?: string | null;
}
